const express = require('express')
const path = require('path')
const { BskyAgent } = require('@atproto/api')

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.static(path.join(__dirname)))

const store = {
  accounts: [],
  templates: [],
  targetLists: [],
  campaigns: [],
  logs: [],
  sendsToday: 0,
  settings: { rateLimit: 5, retryCount: 2 }
}

let seq = 1
function id(){ return String(seq++) }
function now(){ return new Date().toISOString() }

/* Health and KPIs */
app.get('/api/v1/health', (req,res) => res.json({ ok:true, service:'dashboard', time: now() }))
app.get('/api/v1/kpis', (req,res) => res.json({
  accounts: store.accounts.length,
  templates: store.templates.length,
  lists: store.targetLists.length,
  sendsToday: store.sendsToday
}))
app.post('/api/v1/settings', (req,res) => {
  const { rateLimit, retryCount } = req.body || {}
  if (typeof rateLimit === 'number' && rateLimit >= 1) store.settings.rateLimit = rateLimit
  if (typeof retryCount === 'number' && retryCount >= 0) store.settings.retryCount = retryCount
  store.accounts = store.accounts.map(a => ({ ...a, rateLimit: store.settings.rateLimit }))
  res.json({ success:true, settings: store.settings })
})

/* Accounts */
app.get('/api/v1/accounts', (req,res) => res.json({ accounts: store.accounts }))
app.post('/api/v1/add-account', (req,res) => {
  const { handle, password } = req.body || {}
  if (!handle || !password) return res.status(400).json({ success:false, message:'بيانات ناقصة' })
  if (store.accounts.find(a => a.handle === handle)) return res.status(409).json({ success:false, message:'الحساب موجود' })
  const acc = {
    id: id(),
    handle,
    password,
    status: 'نشط',
    dailyCount: 0,
    rateLimit: store.settings.rateLimit,
    windowStart: Date.now(),
    updatedAt: now()
  }
  store.accounts.push(acc)
  res.json({ success:true, account: acc })
})
app.delete('/api/v1/accounts/:id', (req,res) => {
  const i = store.accounts.findIndex(a => a.id === req.params.id)
  if (i === -1) return res.status(404).json({ success:false })
  store.accounts.splice(i,1)
  res.json({ success:true })
})

/* Templates */
app.get('/api/v1/templates', (req,res) => res.json({ templates: store.templates }))
app.post('/api/v1/templates', (req,res) => {
  const { name, content } = req.body || {}
  if (!name || !content) return res.status(400).json({ success:false })
  const tpl = { id: id(), name, content }
  store.templates.push(tpl)
  res.json({ success:true, template: tpl })
})
app.delete('/api/v1/templates/:id', (req,res) => {
  const i = store.templates.findIndex(t => t.id === req.params.id)
  if (i === -1) return res.status(404).json({ success:false })
  store.templates.splice(i,1)
  res.json({ success:true })
})

/* Target lists */
app.get('/api/v1/target-lists', (req,res) => res.json({
  lists: store.targetLists.map(l => ({
    id: l.id,
    name: l.name,
    targetsCount: l.targets.length,
    createdAt: l.createdAt
  }))
}))
app.post('/api/v1/target-lists', (req,res) => {
  const { name } = req.body || {}
  if (!name) return res.status(400).json({ success:false })
  const list = { id: id(), name, targets: [], createdAt: now() }
  store.targetLists.push(list)
  res.json({ success:true, list })
})
app.delete('/api/v1/target-lists/:id', (req,res) => {
  const i = store.targetLists.findIndex(l => l.id === req.params.id)
  if (i === -1) return res.status(404).json({ success:false })
  store.targetLists.splice(i,1)
  res.json({ success:true })
})
app.get('/api/v1/target-lists/:id/targets', (req,res) => {
  const list = store.targetLists.find(l => l.id === req.params.id)
  if (!list) return res.status(404).json({ targets: [] })
  res.json({ targets: list.targets })
})
app.post('/api/v1/target-lists/:id/targets', (req,res) => {
  const list = store.targetLists.find(l => l.id === req.params.id)
  const { handle } = req.body || {}
  if (!list || !handle) return res.status(400).json({ success:false })
  const t = { id: id(), handle, did: 'did:'+Math.random().toString(36).slice(2,10) }
  list.targets.push(t)
  res.json({ success:true, target: t })
})
app.delete('/api/v1/target-lists/:id/targets/:tid', (req,res) => {
  const list = store.targetLists.find(l => l.id === req.params.id)
  if (!list) return res.status(404).json({ success:false })
  const i = list.targets.findIndex(t => t.id === req.params.tid)
  if (i === -1) return res.status(404).json({ success:false })
  list.targets.splice(i,1)
  res.json({ success:true })
})

/* Campaigns */
app.get('/api/v1/campaigns', (req,res) => res.json({
  campaigns: store.campaigns.map(c => ({
    id: c.id,
    name: c.name,
    templateId: c.templateId,
    listId: c.listId,
    templateName: (store.templates.find(t => t.id === c.templateId) || {}).name,
    listName: (store.targetLists.find(l => l.id === c.listId) || {}).name,
    status: c.status,
    delay: c.delay,
    progress: c.progress || { sent:0, failed:0, total:0 }
  }))
}))

function render(content, target){
  return content
    .replaceAll('{{name}}', ((target.handle||'').split('.')[0] || target.handle || ''))
    .replaceAll('{{handle}}', target.handle || '')
    .replaceAll('{{link}}', 'https://bsky.app/profile/' + (target.handle || ''))
}
function ensureWindow(acc){
  const n = Date.now(), w = 3600000
  if (!acc.windowStart || n - acc.windowStart >= w){
    acc.windowStart = n
    acc.dailyCount = 0
  }
}

async function postToBluesky(acc, msg){
  try{
    const agent = new BskyAgent({ service: 'https://bsky.social' })
    await agent.login({ identifier: acc.handle, password: acc.password })
    const record = { $type:'app.bsky.feed.post', text: msg, createdAt: new Date().toISOString(), langs: ['ar','en'] }
    await agent.api.com.atproto.repo.createRecord({
      repo: agent.session.did,
      collection: 'app.bsky.feed.post',
      record
    })
    return { success:true }
  }catch(err){
    return { success:false, error: (err && err.message) ? err.message : String(err) }
  }
}

async function executeCampaign(c){
  const tpl = store.templates.find(t => t.id === c.templateId)
  const list = store.targetLists.find(l => l.id === c.listId)
  if (!tpl || !list){
    c.status = 'فشل'
    store.logs.push({ timestamp: Date.now(), accountHandle:'-', templateName: tpl ? tpl.name : '-', targetHandle:'-', status:'failed', error:'بيانات ناقصة' })
    return
  }
  c.status = 'قيد التنفيذ'
  c.progress = { sent:0, failed:0, total: list.targets.length }
  let ai = 0
  for (const target of list.targets){
    if (c.status === 'موقوفة') break
    let sender = store.accounts[ai]
    if (!sender){
      store.logs.push({ timestamp: Date.now(), accountHandle:'-', templateName: tpl.name, targetHandle: target.handle, status:'failed', error:'لا يوجد حساب' })
      c.progress.failed++
      continue
    }
    ensureWindow(sender)
    if (sender.dailyCount >= sender.rateLimit){
      ai++; sender = store.accounts[ai]
      if (!sender){
        store.logs.push({ timestamp: Date.now(), accountHandle:'-', templateName: tpl.name, targetHandle: target.handle, status:'failed', error:'تجاوز الحد لكل الحسابات' })
        c.progress.failed++
        continue
      }
      ensureWindow(sender)
      if (sender.dailyCount >= sender.rateLimit){
        store.logs.push({ timestamp: Date.now(), accountHandle: sender.handle, templateName: tpl.name, targetHandle: target.handle, status:'failed', error:'الحساب التالي تجاوز الحد' })
        c.progress.failed++
        continue
      }
    }
    const msg = render(tpl.content, target)
    let attempt = 0, posted = false, lastErr = null
    const maxRetries = Math.max(0, store.settings.retryCount || 0)
    while (attempt <= maxRetries && !posted){
      attempt++
      const r = await postToBluesky(sender, msg)
      if (r.success){
        posted = true
        store.logs.push({ timestamp: Date.now(), accountHandle: sender.handle, templateName: tpl.name, targetHandle: target.handle, status: 'success', message: msg })
        sender.dailyCount++
        sender.updatedAt = new Date().toISOString()
        store.sendsToday++
        c.progress.sent++
      }else{
        lastErr = r.error || 'unknown'
        if (/401|Unauthorized/i.test(String(lastErr))){
          store.logs.push({ timestamp: Date.now(), accountHandle: sender.handle, templateName: tpl.name, targetHandle: target.handle, status:'failed', error:'مصادقة فشلت: '+lastErr })
          c.progress.failed++; ai++; break
        }
        await new Promise(r => setTimeout(r, 1000 * attempt))
      }
    }
    if (!posted && lastErr){
      store.logs.push({ timestamp: Date.now(), accountHandle: sender ? sender.handle : '-', templateName: tpl.name, targetHandle: target.handle, status:'failed', error: lastErr })
      c.progress.failed++
    }
    const jitter = 800 + Math.floor(Math.random() * 1700)
    await new Promise(r => setTimeout(r, jitter))
  }
  if (c.status !== 'موقوفة') c.status = 'منفذة'
}

app.post('/api/v1/campaigns', (req,res) => {
  const { name, templateId, listId, delay } = req.body || {}
  const tpl = store.templates.find(t => t.id === templateId)
  const list = store.targetLists.find(l => l.id === listId)
  if (!name || !tpl || !list) return res.status(400).json({ success:false })
  const c = { id: id(), name, templateId, listId, status:'مجدولة', delay: delay || 5, progress: { sent:0, failed:0, total: list.targets.length }, _timer: null }
  store.campaigns.push(c)
  res.json({ success:true, campaign: c })
  c._timer = setTimeout(async () => {
    if (c.status === 'موقوفة') return
    try{
      await executeCampaign(c)
    }catch(err){
      c.status = 'فشل'
      store.logs.push({ timestamp: Date.now(), accountHandle:'-', templateName: tpl.name, targetHandle:'-', status:'failed', error: (err && err.message) ? err.message : String(err) })
    }
  }, (c.delay || 5) * 1000)
})
app.post('/api/v1/campaigns/:id/stop', (req,res) => {
  const c = store.campaigns.find(x => x.id === req.params.id)
  if (!c) return res.status(404).json({ success:false })
  c.status = 'موقوفة'
  if (c._timer){ clearTimeout(c._timer); c._timer = null }
  res.json({ success:true })
})
app.post('/api/v1/campaigns/:id/start', (req,res) => {
  const c = store.campaigns.find(x => x.id === req.params.id)
  if (!c) return res.status(404).json({ success:false })
  const list = store.targetLists.find(l => l.id === c.listId)
  c.status = 'مجدولة'
  c.progress = { sent:0, failed:0, total: list ? list.targets.length : 0 }
  if (c._timer){ clearTimeout(c._timer); c._timer = null }
  c._timer = setTimeout(async () => {
    if (c.status === 'موقوفة') return
    try{
      await executeCampaign(c)
    }catch(err){
      c.status = 'فشل'
      const tpl = store.templates.find(t => t.id === c.templateId)
      store.logs.push({ timestamp: Date.now(), accountHandle:'-', templateName: tpl ? tpl.name : '-', targetHandle:'-', status:'failed', error: (err && err.message) ? err.message : String(err) })
    }
  }, (c.delay || 5) * 1000)
  res.json({ success:true })
})
app.delete('/api/v1/campaigns/:id', (req,res) => {
  const i = store.campaigns.findIndex(c => c.id === req.params.id)
  if (i === -1) return res.status(404).json({ success:false })
  const c = store.campaigns[i]
  if (c && c._timer) clearTimeout(c._timer)
  store.campaigns.splice(i,1)
  res.json({ success:true })
})

/* Logs and direct post */
app.get('/api/v1/logs', (req,res) => res.json({ logs: store.logs }))
app.post('/api/v1/direct-post', async (req,res) => {
  const { text } = req.body || {}
  if (!text) return res.status(400).json({ success:false })
  const acc = store.accounts[0]
  if (!acc) return res.status(400).json({ success:false, message:'لا يوجد حساب' })
  const r = await postToBluesky(acc, text)
  if (r.success){
    store.logs.push({ timestamp: Date.now(), accountHandle: acc.handle, templateName:'-', targetHandle:'-', status:'success', message: text })
    store.sendsToday++
    res.json({ success:true })
  }else{
    store.logs.push({ timestamp: Date.now(), accountHandle: acc.handle, templateName:'-', targetHandle:'-', status:'failed', error: r.error || 'unknown' })
    res.status(500).json({ success:false, message: r.error || 'failed' })
  }
})

/* Static */
app.get('/', (req,res) => res.sendFile(path.join(__dirname, 'index.html')))
app.listen(PORT, () => console.log('listening', PORT))
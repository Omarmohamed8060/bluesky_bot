const express = require('express');
const path = require('path');
const app = express();

// عرض ملفات الواجهة من مجلد public
app.use(express.static(path.join(__dirname, 'public')));

// الصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// تشغيل السيرفر على البورت اللي Railway بيحدده
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
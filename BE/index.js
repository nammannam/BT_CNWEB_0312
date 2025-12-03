const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// Kết nối MongoDB TRƯỚC KHI khởi động server
const mongoURI = 'mongodb://localhost:27017/studentdb';

mongoose.connect(mongoURI)
  .then(() => {
    console.log("✓ Đã kết nối MongoDB thành công");
    
    // Khởi động server SAU KHI MongoDB đã kết nối
    app.listen(PORT, () => {
      console.log(`✓ Server đang chạy trên cổng ${PORT}`);
      console.log(`✓ Truy cập: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("✗ Lỗi kết nối MongoDB: ", err);
    process.exit(1);
  });

// Middleware
app.use(cors()); // Cho phép frontend truy cập API
app.use(express.json()); // Parse JSON request body
app.use(bodyParser.json()); // Alternative JSON parser
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Route kiểm tra server
app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng đến với API Server!' });
});

// Route mẫu
app.get('/api/test', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'API hoạt động tốt!' 
  });
});

const Student = require('./model/Student');
app.get('/api/students', async (req, res) => {
    try{
        const students = await Student.find();
        res.json(students);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sinh viên: ", error);
        res.status(500).json({ message: "Đã xảy ra lỗi" });
    }

});

app.post('/api/students', async (req, res) => {
    try{
        const newStudent = await Student.create(req.body);
        res.status(201).json(newStudent);
    } catch (error) {
        console.error("Lỗi khi thêm sinh viên: ", error);
        res.status(400).json({ message: "Đã xảy ra lỗi" });
    }

});


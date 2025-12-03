import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho form thêm sinh viên
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [stuClass, setStuClass] = useState("");
  const [activeView, setActiveView] = useState("list"); // "list" hoặc "add"

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    setError(null);
    axios.get('http://localhost:5000/api/students')
      .then(response => {
        setStudents(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Lỗi khi fetch danh sách:", error);
        setStudents([]); // Set danh sách rỗng thay vì hiển thị lỗi
        setLoading(false);
      });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      alert("Vui lòng nhập họ tên!");
      return;
    }
    if (!age || age <= 0) {
      alert("Vui lòng nhập tuổi hợp lệ!");
      return;
    }
    if (!stuClass.trim()) {
      alert("Vui lòng nhập lớp!");
      return;
    }
    
    const newStu = { name: name.trim(), age: Number(age), class: stuClass.trim() };
    console.log("Đang gửi dữ liệu:", newStu);
    
    axios.post('http://localhost:5000/api/students', newStu)
      .then(res => {
        console.log("Đã thêm:", res.data);
        // Cập nhật state students để hiển thị luôn học sinh mới:
        setStudents(prev => [...prev, res.data]);
        // Xóa nội dung form sau khi thêm thành công
        setName(""); 
        setAge(""); 
        setStuClass("");
        setActiveView("list"); // Chuyển về view danh sách
        alert("Thêm sinh viên thành công!");
      })
      .catch(err => {
        console.error("Lỗi khi thêm:", err);
        console.error("Chi tiết lỗi:", err.response?.data);
        alert("Không thể thêm sinh viên. Vui lòng thử lại!");
      });
  };

  if (loading) {
    return (
      <div className="container">
        <h1>📚 Quản Lý Sinh Viên</h1>
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>📚 Quản Lý Sinh Viên</h1>
      
      {/* Header Navigation */}
      <div className="header-nav">
        <button 
          className={`nav-btn ${activeView === "list" ? "active" : ""}`}
          onClick={() => setActiveView("list")}
        >
          📋 Xem Danh Sách
        </button>
        <button 
          className={`nav-btn ${activeView === "add" ? "active" : ""}`}
          onClick={() => setActiveView("add")}
        >
          ➕ Thêm Sinh Viên
        </button>
      </div>

      {/* View Danh Sách */}
      {activeView === "list" && (
        <>
          <div className="view-header">
            <h2>Danh Sách Sinh Viên</h2>
            <div className="student-count">
              Tổng số: <strong>{students.length}</strong> sinh viên
            </div>
          </div>
          
          <table className="student-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ và Tên</th>
                <th>Tuổi</th>
                <th>Lớp</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    Chưa có sinh viên nào trong danh sách
                  </td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={student._id || index}>
                    <td>{index + 1}</td>
                    <td>{student.name}</td>
                    <td>{student.age}</td>
                    <td>{student.class}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {/* View Thêm Sinh Viên */}
      {activeView === "add" && (
        <div className="form-container">
          <h2>Thêm Sinh Viên Mới</h2>
          <form onSubmit={handleAddStudent} className="add-student-form">
            <div className="form-group">
              <label htmlFor="name">Họ và Tên:</label>
              <input
                id="name"
                type="text"
                placeholder="Nhập họ tên sinh viên"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age">Tuổi:</label>
              <input
                id="age"
                type="number"
                placeholder="Nhập tuổi"
                value={age}
                onChange={e => setAge(e.target.value)}
                min="1"
                max="100"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="class">Lớp:</label>
              <input
                id="class"
                type="text"
                placeholder="Nhập tên lớp (VD: 10A1)"
                value={stuClass}
                onChange={e => setStuClass(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                ✓ Thêm Học Sinh
              </button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => {
                  setActiveView("list");
                  setName("");
                  setAge("");
                  setStuClass("");
                }}
              >
                ✕ Hủy
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;

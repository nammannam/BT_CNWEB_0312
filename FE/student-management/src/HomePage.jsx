import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho form thêm sinh viên
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [stuClass, setStuClass] = useState("");
  const [activeView, setActiveView] = useState("list"); // "list" hoặc "add"
  
  // State cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  
  // State cho sắp xếp
  const [sortAsc, setSortAsc] = useState(true); // true = A→Z, false = Z→A

  // Fetch students khi component mount hoặc khi quay về từ trang khác
  useEffect(() => {
    fetchStudents();
  }, [location.key]); // Re-fetch khi navigate back

  const fetchStudents = () => {
    setLoading(true);
    setError(null);
    axios.get('http://localhost:5000/api/students')
      .then(response => {
        console.log("Dữ liệu từ API:", response.data);
        // Kiểm tra xem mỗi student có _id không
        const studentsWithId = response.data.filter(student => {
          if (!student._id) {
            console.warn("Student không có _id:", student);
            return false;
          }
          return true;
        });
        setStudents(studentsWithId);
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

  const handleEdit = (id) => {
    if (!id) {
      console.error("ID không hợp lệ:", id);
      alert("Không thể chỉnh sửa - ID sinh viên không hợp lệ!");
      return;
    }
    console.log("Đang chuyển đến trang edit với ID:", id);
    navigate(`/edit/${id}`);
  };

  const handleDelete = (id, name) => {
    if (!id) {
      console.error("ID không hợp lệ:", id);
      alert("Không thể xóa - ID sinh viên không hợp lệ!");
      return;
    }

    // Xác nhận trước khi xóa
    if (!window.confirm(`Bạn có chắc muốn xóa sinh viên "${name}"?`)) {
      return;
    }

    console.log("Đang xóa student với ID:", id);

    axios.delete(`http://localhost:5000/api/students/${id}`)
      .then(res => {
        console.log("Phản hồi từ server:", res.data);
        
        // Cập nhật state ngay lập tức bằng cách filter ra student vừa xóa
        setStudents(prevList => {
          const newList = prevList.filter(s => s._id !== id);
          console.log("Danh sách sau khi xóa:", newList.length, "sinh viên");
          return newList;
        });
        
        alert("Đã xóa sinh viên thành công!");
      })
      .catch(err => {
        console.error("Lỗi khi xóa:", err);
        console.error("Chi tiết lỗi:", err.response?.data);
        
        // Nếu lỗi 404, có nghĩa student đã bị xóa rồi
        if (err.response?.status === 404) {
          alert("Sinh viên không tồn tại hoặc đã bị xóa. Đang làm mới danh sách...");
          // Refresh lại danh sách từ server
          fetchStudents();
        } else {
          alert("Không thể xóa sinh viên. Vui lòng thử lại!");
        }
      });
  };

  // Lọc danh sách sinh viên theo từ khóa tìm kiếm
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sắp xếp danh sách đã lọc theo tên
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const nameA = a.name.toLowerCase();
    const nameB = b.name.toLowerCase();
    
    if (nameA < nameB) return sortAsc ? -1 : 1;
    if (nameA > nameB) return sortAsc ? 1 : -1;
    return 0;
  });

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
          
          {/* Ô tìm kiếm */}
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="🔍 Tìm kiếm theo tên..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
                title="Xóa tìm kiếm"
              >
                ✖
              </button>
            )}
          </div>

          {/* Hiển thị kết quả tìm kiếm */}
          {searchTerm && (
            <div className="search-result-info">
              Tìm thấy <strong>{filteredStudents.length}</strong> sinh viên phù hợp
            </div>
          )}
          
          {/* Nút sắp xếp */}
          <div className="sort-container">
            <button 
              className="sort-btn"
              onClick={() => setSortAsc(prev => !prev)}
              title="Nhấn để đổi thứ tự sắp xếp"
            >
              🔤 Sắp xếp theo tên: {sortAsc ? 'A → Z' : 'Z → A'}
            </button>
          </div>
          
          <table className="student-table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ và Tên</th>
                <th>Tuổi</th>
                <th>Lớp</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-data">
                    {searchTerm 
                      ? `Không tìm thấy sinh viên nào có tên chứa "${searchTerm}"`
                      : "Chưa có sinh viên nào trong danh sách"
                    }
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student, index) => {
                  // Debug: Log student ID
                  if (!student._id) {
                    console.error("Student thiếu _id:", student);
                  }
                  
                  return (
                    <tr key={student._id}>
                      <td>{index + 1}</td>
                      <td>{student.name}</td>
                      <td>{student.age}</td>
                      <td>{student.class}</td>
                      <td>
                        <button 
                          className="btn-edit"
                          onClick={() => handleEdit(student._id)}
                          disabled={!student._id}
                        >
                          ✏️ Sửa
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDelete(student._id, student.name)}
                          disabled={!student._id}
                        >
                          🗑️ Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })
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

export default HomePage;

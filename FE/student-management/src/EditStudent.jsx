import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

function EditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [stuClass, setStuClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch thông tin sinh viên hiện tại
  useEffect(() => {
    axios.get(`http://localhost:5000/api/students/${id}`)
      .then(res => {
        setName(res.data.name);
        setAge(res.data.age);
        setStuClass(res.data.class);
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi khi lấy thông tin:", err);
        setError("Không thể tải thông tin sinh viên");
        setLoading(false);
      });
  }, [id]);

  const handleUpdate = (e) => {
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

    const updatedData = {
      name: name.trim(),
      age: Number(age),
      class: stuClass.trim()
    };

    console.log("Đang cập nhật:", updatedData);

    axios.put(`http://localhost:5000/api/students/${id}`, updatedData)
      .then(res => {
        console.log("Đã cập nhật:", res.data);
        alert("Cập nhật sinh viên thành công!");
        navigate("/");
      })
      .catch(err => {
        console.error("Lỗi khi cập nhật:", err);
        alert("Không thể cập nhật sinh viên. Vui lòng thử lại!");
      });
  };

  if (loading) {
    return (
      <div className="container">
        <h1>📝 Chỉnh Sửa Sinh Viên</h1>
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <h1>📝 Chỉnh Sửa Sinh Viên</h1>
        <div className="error">{error}</div>
        <button 
          className="btn-cancel"
          onClick={() => navigate("/")}
          style={{ marginTop: '20px' }}
        >
          ← Quay về
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>📝 Chỉnh Sửa Sinh Viên</h1>
      
      <div className="form-container">
        <h2>Cập nhật thông tin sinh viên</h2>
        <form onSubmit={handleUpdate} className="add-student-form">
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
              ✓ Cập Nhật
            </button>
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate("/")}
            >
              ✕ Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditStudent;

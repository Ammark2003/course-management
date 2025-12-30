import { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api/courses";

function App() {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    courseCode: "",
    courseName: "",
    category: "",
    duration: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setCourses(data);
    } catch (err) {
      setError("Failed to fetch courses");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.courseCode ||
      !formData.courseName ||
      !formData.category ||
      !formData.duration
    ) {
      setError("All fields are required");
      return;
    }

    if (isNaN(formData.duration)) {
      setError("Duration must be numeric");
      return;
    }

    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setFormData({
        courseCode: "",
        courseName: "",
        category: "",
        duration: "",
      });
      setEditingId(null);
      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (course) => {
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      category: course.category,
      duration: course.duration,
    });
    setEditingId(course._id);
    setError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      fetchCourses();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setFormData({ courseCode: "", courseName: "", category: "", duration: "" });
    setEditingId(null);
    setError("");
  };

  return (
    <div className="container">
      <h1>Online Course Management System</h1>

      <div className="form-section">
        <h2>{editingId ? "Update Course" : "Add New Course"}</h2>
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Course Code:</label>
            <input
              type="text"
              name="courseCode"
              value={formData.courseCode}
              onChange={handleChange}
              placeholder="e.g., CS101"
            />
          </div>

          <div className="form-group">
            <label>Course Name:</label>
            <input
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              placeholder="e.g., Introduction to Programming"
            />
          </div>

          <div className="form-group">
            <label>Category:</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Computer Science"
            />
          </div>

          <div className="form-group">
            <label>Duration (hours):</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 40"
            />
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              {editingId ? "Update Course" : "Add Course"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="list-section">
        <h2>Course List</h2>
        {courses.length === 0 ? (
          <p className="no-courses">
            No courses available. Add your first course!
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Category</th>
                <th>Duration (hrs)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.courseCode}</td>
                  <td>{course.courseName}</td>
                  <td>{course.category}</td>
                  <td>{course.duration}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(course)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default App;

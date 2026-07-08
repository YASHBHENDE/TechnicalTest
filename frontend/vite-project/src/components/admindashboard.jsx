/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const initialForm = {
  title: "",
  description: "",
  category: "",
  duration: "",
  status: "Draft",
};

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  async function fetchCourses() {
    try {
      setError("");

      const response = await axios.get("http://localhost:3001/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses(response.data.courses || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setFormLoading(true);
      setError("");

      if (!formData.title || !formData.description || !formData.category || !formData.duration) {
        setError("All fields are required");
        return;
      }

      if (editingCourseId) {
        await axios.put(
          `http://localhost:3001/api/courses/${editingCourseId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        await axios.post("http://localhost:3001/api/courses", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      setFormData(initialForm);
      setEditingCourseId(null);
      fetchCourses();
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setFormLoading(false);
    }
  }

  function handleEdit(course) {
    setEditingCourseId(course._id);
    setFormData({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      duration: course.duration || "",
      status: course.status || "Draft",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(courseId) {
    try {
      setDeleteLoadingId(courseId);

      await axios.delete(`http://localhost:3001/api/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCourses((prev) => prev.filter((course) => course._id !== courseId));
    } catch (error) {
      alert(error.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoadingId(null);
    }
  }

  function handleCancelEdit() {
    setEditingCourseId(null);
    setFormData(initialForm);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* top bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
            <p className="text-sm text-slate-500">Welcome, {user?.fullName}</p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* role badge */}
        <div className="mb-6">
          <span className="inline-block bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
            Logged in as {user?.role}
          </span>
        </div>

        {error && (
          <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* form */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            {editingCourseId ? "Edit Course" : "Create Course"}
          </h2>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter course title"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Backend / Frontend / DevOps"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration
              </label>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="8 weeks"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter course description"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-70"
              >
                {formLoading
                  ? editingCourseId
                    ? "Updating..."
                    : "Creating..."
                  : editingCourseId
                  ? "Update Course"
                  : "Create Course"}
              </button>

              {editingCourseId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-3 rounded-xl font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* courses list */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">All Courses</h2>

          {loading ? (
            <div className="text-center text-slate-600 text-lg mt-10">
              Loading courses...
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-600">
              No courses found
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                      {course.title}
                    </h3>

                    <p className="text-slate-600 mb-4">{course.description}</p>

                    <div className="space-y-2 text-sm text-slate-500">
                      <p>
                        <span className="font-semibold text-slate-700">Category:</span>{" "}
                        {course.category}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Duration:</span>{" "}
                        {course.duration}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Status:</span>{" "}
                        {course.status}
                      </p>
                      <p>
                        <span className="font-semibold text-slate-700">Created By:</span>{" "}
                        {course.createdBy?.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleEdit(course)}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 py-3 rounded-xl font-semibold"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(course._id)}
                      disabled={deleteLoadingId === course._id}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold disabled:opacity-70"
                    >
                      {deleteLoadingId === course._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Courses = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

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

  async function handleEnroll(courseId) {
    try {
      setEnrollingCourseId(courseId);

      await axios.post(
        `http://localhost:3001/api/enrollments/${courseId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Enrolled successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrollingCourseId(null);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* top bar */}
      <div className="bg-white shadow-sm border-b">

        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Courses</h1>
            <p className="text-sm text-slate-500">
              Welcome, {user?.fullName}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* role badge */}
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
            Logged in as {user?.role}
          </span>
        </div>

        {/* error */}
        {error && (
          <div className="mb-6 bg-red-100 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* loading */}
        {loading ? (
          <div className="text-center text-slate-600 text-lg mt-10">
            Loading courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center text-slate-600">
            No courses found
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">
                    {course.title}
                  </h2>

                  <p className="text-slate-600 mb-4">
                    {course.description}
                  </p>

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
                        <span className="font-semibold text-slate-700">Created By:</span>{" "}
                        {course.createdBy?.fullName}
                    </p>

                    <p>
                        <span className="font-semibold text-slate-700">Status:</span>{" "}
                        {course.status}
                    </p>
                    </div>
                </div>

                {/* buttons */}
                <div className="mt-6">
                  {user?.role === "learner" ? (
                    <button
                      onClick={() => handleEnroll(course._id)}
                      disabled={enrollingCourseId === course._id}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold disabled:opacity-70"
                    >
                      {enrollingCourseId === course._id
                        ? "Enrolling..."
                        : "Enroll"}
                    </button>
                  ) : (
                    <div className="text-sm text-slate-500 italic">
                      Admin can manage courses from dashboard
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
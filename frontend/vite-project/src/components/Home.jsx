import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-3xl p-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
          Course Management System
        </h1>

        <p className="text-slate-600 text-lg mb-8 leading-relaxed">
          A platform where admins can create and manage courses, and learners
          can explore courses and enroll in them.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/login"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="w-full sm:w-auto border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold px-8 py-3 rounded-xl transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
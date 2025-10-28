import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";

const UserLogin = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  const { showSuccessNotification } = useNotification();

  // Redirect if already logged in
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.username, form.password);
    if (result.success) {
      showSuccessNotification("Login Successful", `Welcome back, ${form.username}!`);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">User Login</h2>
        {error && <div className="mb-4 text-red-700 bg-red-50 border border-red-200 p-3 rounded">{error}</div>}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input name="username" value={form.username} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required className="mt-1 w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white rounded py-2 hover:bg-green-700 disabled:opacity-50">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <div className="mt-4 text-sm text-gray-600">
          <div className="mb-2">
            Don&apos;t have an account? <Link to="/register" className="text-green-700 hover:underline">Register</Link>
          </div>
          <div>
            <Link to="/forgot-password" className="text-green-700 hover:underline">Forgot Password?</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;

import React, { useState } from "react";
import { Link } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      setMessage("Password reset functionality is not yet implemented. Please contact support for assistance.");
    } catch (err) {
      setError("Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Forgot Password</h2>
        {error && <div className="mb-4 text-red-700 bg-red-50 border border-red-200 p-3 rounded">{error}</div>}
        {message && <div className="mb-4 text-blue-700 bg-blue-50 border border-blue-200 p-3 rounded">{message}</div>}
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="mt-1 w-full border border-gray-300 rounded px-3 py-2" 
              placeholder="Enter your email address"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-green-600 text-white rounded py-2 hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        
        <div className="mt-4 text-sm text-gray-600 text-center">
          <Link to="/login" className="text-green-700 hover:underline">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

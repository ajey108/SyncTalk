import React, { useState } from "react";
import { IoLogoWechat } from "react-icons/io5";
import API from "../api/axiosInstance";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Sign up");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (currentState === "Sign up") {
        await API.post(`/auth/register`, formData, {
          withCredentials: true, // Enable cookies
        });

        toast("Account created successfully! Please log in.");
        setCurrentState("Login");
      } else {
        await API.post(`/auth/login`, formData, {
          withCredentials: true, // Enable cookies
        });
        toast.success("Login successful! 🎉");
        setTimeout(() => {
          window.location.href = "/chat";
        }, 2000); // Wait 2 seconds before redirecting
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
      toast("something went wrong");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-6"
      style={{ backgroundImage: "url('/chatcover.png')" }}
    >
      {/* Left Side Icon */}
      <div className="hidden md:flex flex-col items-center mr-10">
        <IoLogoWechat className="w-[200px] h-[200px] text-white opacity-90 animate-bounce" />
        <p className="text-white text-2xl font-semibold mt-4">
          Welcome to ChatApp!
        </p>
      </div>

      {/* Login Form */}
      <form
        className="bg-white p-8 md:p-12 rounded-lg shadow-xl flex flex-col items-center border border-gray-200 w-full max-w-sm"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-gray-800">{currentState}</h2>

        {/* Show username field only for sign-up */}
        {currentState === "Sign up" && (
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="mt-4 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-4 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="mt-4 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />

        {/* Display error messages */}
        {error && <p className="text-red-500 mt-2">{error}</p>}

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg px-6 py-2 mt-6 w-full transition-all duration-300"
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : currentState === "Sign up"
            ? "Create Account"
            : "Login"}
        </button>

        {/* Switch between Login/Signup */}
        <div className="mt-4 text-gray-600">
          {currentState === "Sign up" ? (
            <p>
              Already have an account?{" "}
              <span
                onClick={() => setCurrentState("Login")}
                className="text-blue-500 font-semibold cursor-pointer hover:underline"
              >
                Login Now
              </span>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <span
                onClick={() => setCurrentState("Sign up")}
                className="text-blue-500 font-semibold cursor-pointer hover:underline"
              >
                Sign Up Here
              </span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;

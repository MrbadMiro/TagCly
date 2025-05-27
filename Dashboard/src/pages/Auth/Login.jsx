import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../redux/api/usersApiSlice.js";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/features/auth/authSlice.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ ...res, role: res.role })); // Store user info in Redux
      navigate("/"); // Redirect to the home page after successful login
    } catch (err) {
      console.error("Failed to login:", err);
      if (err.status === 404) {
        alert("Invalid email or password. Please try again.");
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-[100vh] flex items-center flex-col">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg bg-slate-200">
        <p className="text-2xl font-medium m-auto">Login</p>
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] outline-none rounded w-full py-2 mt-1"
            type="email"
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-[#DADADA] outline-none py-2 rounded w-full P-4 mt-1"
            type="password"
          />
        </div>
        <button className="bg-blue-500 text-white w-full py-2 rounded-md text-base" type="submit">
          Login
        </button>
        <div>
          <p
            onClick={() => navigate("/forgot-password")} // Redirect to the Forgot Password page
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Forgot password?
          </p>
        </div>
      </div>
    </form>
  );
}
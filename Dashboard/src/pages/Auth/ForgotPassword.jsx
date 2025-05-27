import React, { useState } from "react";
import { useForgotPasswordMutation } from "../../redux/api/usersApiSlice.js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [forgotPassword] = useForgotPasswordMutation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email }).unwrap();
      toast.success("OTP sent to your email. Please check your inbox.");
      navigate("/reset-password", { state: { email } }); // Pass email as state
    } catch (err) {
      console.error("Failed to send OTP:", err);
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-[100vh] flex items-center flex-col">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg bg-slate-200">
        <p className="text-2xl font-medium m-auto">Forgot Password</p>
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] outline-none rounded w-full py-2 mt-1"
            type="email"
            placeholder="Enter your email"
          />
        </div>
        <button className="bg-blue-500 text-white w-full py-2 rounded-md text-base" type="submit">
          Send OTP
        </button>
      </div>
    </form>
  );
}
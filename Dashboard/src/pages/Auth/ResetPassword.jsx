import React, { useState } from "react";
import { useResetPasswordMutation, useValidateOTPMutation } from "../../redux/api/usersApiSlice.js";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { toast } from "react-toastify";

export default function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetPassword] = useResetPasswordMutation();
  const [validateOTP] = useValidateOTPMutation();
  const navigate = useNavigate();

  // Get the email from the location state
  const location = useLocation();
  const email = location.state?.email; // Access the email passed from ForgotPassword

  const handleOTPSubmit = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await validateOTP({ email, otp }).unwrap();
      if (response.success) {
        setShowResetForm(true);
        toast.success("OTP verified successfully.");
      } else {
        toast.error(response.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to validate OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      await resetPassword({ email, otp, password }).unwrap();
      toast.success("Password reset successful. Please login with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to reset password. Please try again.");
    }
  };

  return (
    <div className="min-h-[100vh] flex items-center flex-col">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg bg-slate-200">
        <p className="text-2xl font-medium m-auto">Reset Password</p>

        {!showResetForm && (
          <form onSubmit={handleOTPSubmit} className="w-full">
            <div className="w-full">
              <p>OTP</p>
              <input
                onChange={(e) => setOtp(e.target.value)}
                value={otp}
                className="border border-[#DADADA] outline-none rounded w-full py-2 mt-1"
                type="text"
                placeholder="Enter OTP"
              />
            </div>
            <button
              className="bg-blue-500 text-white w-full py-2 rounded-md text-base mt-4"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        )}

        {showResetForm && (
          <form onSubmit={handleResetSubmit} className="w-full">
            <div className="w-full">
              <p>New Password</p>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border border-[#DADADA] outline-none rounded w-full py-2 mt-1"
                type="password"
                placeholder="Enter new password"
              />
            </div>
            <div className="w-full">
              <p>Confirm Password</p>
              <input
                onChange={(e) => setConfirmPassword(e.target.value)}
                value={confirmPassword}
                className="border border-[#DADADA] outline-none rounded w-full py-2 mt-1"
                type="password"
                placeholder="Confirm new password"
              />
            </div>
            <button
              className="bg-blue-500 text-white w-full py-2 rounded-md text-base mt-4"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
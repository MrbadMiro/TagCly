import React, { useState } from "react";
import { useRegisterMutation } from "../../../redux/api/usersApiSlice";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function AddUsers() {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Check user roles
  const isAdmin = userInfo && userInfo.role === "admin";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Split fullName into firstName and lastName for the profile
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Prepare the payload
    const newUser = {
      username,
      email,
      password,
      role,
      profile: {
        firstName,
        lastName,
      },
      adminCreated: true, // Add this flag to indicate this is admin creating a user
    };

    console.log("Submitting user data:", newUser);

    try {
      // Call the register mutation
      const response = await register(newUser).unwrap();
      console.log("User created successfully:", response);
      toast.success("User added successfully!");
      navigate("/users"); // Redirect to the users list page
    } catch (err) {
      console.error("Failed to add user:", err);
      toast.error(err.data?.message || "Failed to add user. Please try again.");
    }
  };

  // Only allow Admin to access this page
  if (!isAdmin) {
    return <div>You do not have permission to access this page.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Add New User</h1>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        {/* Username Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Full Name Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Email Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Password Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {isLoading ? "Adding..." : "Add User"}
        </button>
      </form>
    </div>
  );
}

export default AddUsers;
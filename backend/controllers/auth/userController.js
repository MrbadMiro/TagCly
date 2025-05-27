import User from "../../models/database/userModel.js";
import asyncHandler from "../../middlewares/asyncHandler.js";
import bcrypt from "bcryptjs";
import createToken from "../../utils/createToken.js";

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, role, adminCreated } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please fill all the inputs." });
  }

  try {
    // Check if a user with the same email already exists
    const userExistsByEmail = await User.findOne({ email });
    if (userExistsByEmail) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: role || "user", // Default role to "user" if not provided
      isAdmin: role === "admin", // Ensure isAdmin flag is correctly set
    });

    // Save the new user to the database
    await newUser.save();

    // Only generate token if this isn't an admin creating a user
    if (!adminCreated) {
      createToken(res, newUser._id);
    }

    // Return the created user data (excluding sensitive information like password)
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      isAdmin: newUser.isAdmin,
    });
  } catch (error) {
    console.error("Error creating user:", error);

    // Handle any other errors
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide both email and password." });
  }

  const existingUser = await User.findOne({ email });

  if (!existingUser) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const isPasswordValid = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  createToken(res, existingUser._id);

  res.status(200).json({
    _id: existingUser._id,
    username: existingUser.username,
    email: existingUser.email,
    role: existingUser.role,
    isAdmin: existingUser.isAdmin,
  });
});

const logoutCurrentUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httyOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // ✅ Exclude password field for security
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
    });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const updateCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      user.password = hashedPassword;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const deleteUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.isAdmin) {
      res.status(400);
      throw new Error("Cannot delete admin user");
    }

    await User.deleteOne({ _id: user._id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found.");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.isAdmin = Boolean(req.body.isAdmin);

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
};

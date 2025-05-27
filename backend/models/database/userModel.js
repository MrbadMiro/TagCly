import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      // Remove any unique constraint here if it existed
    },
    email: {
      type: String,
      required: true,
      unique: true, // Only email is unique
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profile: {
      firstName: String,
      lastName: String,
      phoneNumber: String,
      address: String,
      profileImage: String,
    },
    pets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
      },
    ],
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "inactive",
    },
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
  },
  { timestamps: true }
);

// Check for username uniqueness in the controller instead if needed, not at the database level

const User = mongoose.model("User", userSchema);

export default User;
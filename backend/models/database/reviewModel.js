import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true }, // User's name
    rating: { type: Number, required: true, min: 1, max: 5 }, // 1-5 rating
    comment: { type: String, required: true }, // User's review comment
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Links to the user who posted the review
    },
  },
  { timestamps: true }
);

export default reviewSchema;

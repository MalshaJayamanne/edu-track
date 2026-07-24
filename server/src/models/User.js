import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    aiCredits: {
      type: Number,
      default: 20
    },
    theme: {
      type: String,
      default: "light"
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

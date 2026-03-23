import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    githubLink: {
      type: String,
    },

    leetcodeLink: {
      type: String,
    },

    linkedinLink: {
      type: String,
    },

    year: {
      type: String,
      enum: ["1", "2", "3", "4"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
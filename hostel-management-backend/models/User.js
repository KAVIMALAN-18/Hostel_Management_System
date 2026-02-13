const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["admin", "warden", "student"],
      default: "student"
    },
    assignedHostel: {
      type: String,
      default: null
    },
    assignedFloor: {
      type: String,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true   // ✅ VERY IMPORTANT FIX
    }
  },
  { timestamps: true }
);

// ✅ Correct password hashing hook (NO next())
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);

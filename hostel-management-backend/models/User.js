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
      lowercase: true,
      validate: {
        validator: function(v) {
          // Strict patterns: admin@hostel.ac.in, *@warden.ac.in, *@student.ac.in
          return /^admin@hostel\.ac\.in$/.test(v) || 
                 /^[a-zA-Z0-9._%+-]+@warden\.ac\.in$/.test(v) || 
                 /^[a-zA-Z0-9._%+-]+@student\.ac\.in$/.test(v);
        },
        message: props => `${props.value} is not a valid institutional email. Use @hostel.ac.in, @warden.ac.in, or @student.ac.in.`
      }
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
    isActive: {
      type: Boolean,
      default: true
    },
    // Warden-specific fields
    assignedHostel: {
      type: String,
      trim: true
    },
    assignedFloor: {
      type: String,
      trim: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Male'
    },
    employeeId: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// ✅ Correct password hashing hook (NO next())
userSchema.pre("save", async function () {
  // 1. Role-specific email pattern validation
  if (this.isModified("email")) {
    if (this.role === 'admin' && this.email !== 'admin@hostel.ac.in') {
      throw new Error('Admin email must be admin@hostel.ac.in');
    }
    if (this.role === 'warden' && !this.email.endsWith('@warden.ac.in')) {
      throw new Error('Warden email must end with @warden.ac.in');
    }
    if (this.role === 'student' && !this.email.endsWith('@student.ac.in')) {
      throw new Error('Student email must end with @student.ac.in');
    }
  }

  // 2. Hash password
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userSchema);


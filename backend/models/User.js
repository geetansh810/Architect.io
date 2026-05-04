import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['Architect', 'Admin'], default: 'Architect' },
    lastLogin: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null },
    otpResendCount: { type: Number, default: 0 },
    location: {
      country: { type: String, default: 'Unknown' },
      region: { type: String, default: 'Unknown' },
      city: { type: String, default: 'Unknown' },
      zip: { type: String, default: 'Unknown' },
      lat: { type: Number, default: 0 },
      lon: { type: Number, default: 0 },
      ip: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare passwords
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password; // never expose password
    return ret;
  },
});

const User = mongoose.model('User', userSchema);
export { User };
export default User;

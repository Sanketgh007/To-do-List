const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Only create index for email
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
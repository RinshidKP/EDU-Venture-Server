import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expirationDate: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 1000 * 60 * 5);
    },
  },
});

const OtpModel = model('otp', otpSchema);

export default OtpModel;
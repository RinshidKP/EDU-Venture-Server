import OtpModel from "../models/otpModel.js";

class OtpRepository {
  async createOtp(email, otp) {
    try {
      const newOtp = await OtpModel.create({ email, otp });
      return newOtp;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to create an OTP');
    }
  }

  async findOtpByEmail(email) {
    try {
      const otp = await OtpModel.findOne({ email });
      return otp;
    } catch (error) {
      console.error(error);
      throw new Error('Failed to get OTP by email');
    }
  }

  async deleteOtpByEmail(email) {
    try {
      await OtpModel.deleteOne({ email });
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete OTP by email');
    }
  }
}

export default OtpRepository;

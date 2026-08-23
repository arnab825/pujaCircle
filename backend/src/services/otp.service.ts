/**
 * OTP Gateway Service Skeleton
 * Abstracted interface supporting future provider plug-ins.
 */
export const otpService = {
  sendOtp: async (phoneNumber: string, otp: string) => {},
  verifyOtp: async (phoneNumber: string, otp: string) => {},
};

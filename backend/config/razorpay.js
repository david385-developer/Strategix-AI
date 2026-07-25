import Razorpay from "razorpay";
import dotenv from "dotenv";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mock_key_12345",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_mock_secret_12345",
});

export default razorpay;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import pic from "../assets/Logo-1.png"
import axios from "axios";

const VerifyOtp = () => {
  const [otp, setOtp] = useState<string>("");
  const [timer, setTimer] = useState<number>(300);
  const [otpExpired, setOtpExpired] = useState<boolean>(false);
  const navigate = useNavigate();
  
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);

  useEffect(() => {


    if (timer === 0) {
      setOtpExpired(true);
      return
    } 
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);

      return () => clearInterval(interval);
    
  }, [timer]);




  const resendOtp = async () => {
    const email = localStorage.getItem("email");
    if (email) {
      try {
        await axios.post("http://localhost:8080/auth/request-otp", { email });
        setTimer(300);
          setOtpExpired(false);
        startTimer();
        triggerAlert("OTP sent again.");
      } catch (error) {
        alert("Failed to resend OTP. Please try again.");
      }
    }
  };
  
  const startTimer = () => {
    const countdown = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(countdown);
        }
        return prevTimer - 1;
      });
    }, 1000);
  };
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const triggerAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };



  const handleSubmitOtp = async () => {
    if (otpExpired || timer <= 0) {
    triggerAlert("OTP has expired. Please request a new one.");
    return;
  }
    try {
      const email = localStorage.getItem("email");
      const response = await axios.post("http://localhost:8080/auth/verify-otp", {
        email,
        otp,
      }, {
        withCredentials: true,
      })
      if (response.status === 200) {
        console.log("OTP verified successfully");
        navigate("/dashboard");
      }
      else {
        console.error("OTP verification failed:", response?.data);
        triggerAlert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      triggerAlert("Invalid OTP. Please try again.");
      console.error("Error verifying OTP:", error);
    }
  };

  return (
    <div className="bg-blue-100 flex items-center justify-center h-screen bg-gradient-to-br from-blue-900 to-blue-900 font-poppins relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
  className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row w-full max-w-4xl"
      >
        {/* Left Panel - OTP Form */}
  <div className="w-full md:w-2/5 bg-teal-50 p-8 flex flex-col">
          <div className="flex items-center mb-8">
            <img src={pic} alt="Logo" className="w-13 h-10" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">OTP Verification</h2>
            <p className="text-sm text-gray-600">Enter the code sent to your email</p>
          </div>
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-1">Time remaining: {Math.floor(timer / 60)}:{timer % 60 < 10 ? `0${timer % 60}` : timer % 60}</p>
            {otpExpired && <p className="text-red-500 text-sm">OTP expired. Please request a new one.</p>}
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="w-full py-3 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            />
          </div>

          <button
            onClick={handleSubmitOtp}
            className="w-full bg-blue-900 text-white py-3 rounded-full font-medium hover:bg-blue-800 transition duration-300"
          >
            VERIFY OTP
          </button>
          <p className="text-sm text-gray-600 mt-4 text-center">
            Didn't receive OTP?{' '}
            <button
              onClick={resendOtp}
              className="text-blue-700 hover:underline font-medium"
              type="button"
            >
              Resend
            </button>
          </p>
        </div>

            {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-10 right-10 flex bg-white rounded shadow-lg border border-gray-100 w-80 z-50"
          >
            <div className="flex items-center justify-center bg-orange-500 px-3 rounded-l">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
              </svg>
            </div>
            <div className="flex-1 px-4 py-3">
              <div className="flex justify-between items-start">
                <p className="text-gray-800 font-semibold">Alert!</p>
                <button className="text-gray-400 hover:text-gray-600" onClick={handleCloseAlert}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-gray-600 text-sm mt-1">{alertMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Right Panel - Welcome */}
  <div className="hidden md:flex w-3/5 bg-gradient-to-br from-indigo-300 via-indigo-500 to-indigo-700 p-12 flex-col justify-between relative">
          <div className="flex flex-col items-start">
            <h1 className="text-white text-5xl font-bold mb-3">Secure Access</h1>
            <p className="text-white text-opacity-80 mb-6 max-w-sm">
              We just need to verify your identity to proceed. Please enter the code from your email.
            </p>
            <p className="text-white text-opacity-60 text-sm">
              Didn't receive the code? Check your spam folder or request a new one.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOtp;
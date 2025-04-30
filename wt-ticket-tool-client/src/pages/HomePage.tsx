import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import pic from "../assets/Logo-1.png"



declare global {
  interface Window {
    google: any;
  }
}

const HomePage = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const navigate = useNavigate();



  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };
  useEffect(() => {
    localStorage.clear();
  }, []);



  const triggerAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const handleLogin = async () => {
    if (!name && !email) {
      triggerAlert("Don't forget to enter your name and email.");
      return;
    }
    const nameRegex = /^[a-zA-Z\s]+$/; 
  if (!nameRegex.test(name)) {
    triggerAlert("Name must not contain special characters or numbers.");
    return;
  }

    if (!name.trim()) {
      triggerAlert("Please enter your name.");
      return;
    }

    if (!email) {
      triggerAlert("Please enter your email.");
      return;
    }


    const emailRegex = /^[a-zA-Z0-9._%+-]+@wissen\.com$/;
    if (!emailRegex.test(email)) {
      triggerAlert("Email must be in the format user@wissen.com");
      return;
    }

    localStorage.setItem("name", name);
    localStorage.setItem("email", email);
    try {
      navigate("/verify-otp", { state: { email } });
      await axios.post("http://localhost:8080/auth/request-otp", {
        email,
      }, {
        withCredentials: true,
      });

      console.log("OTP sent successfully");


    } catch (error) {
      console.error("Error sending OTP:", error);
      triggerAlert("Failed to send OTP. Please try again.");
    }

    console.log("name2: " + name);
    console.log("email2: " + email);

  };



  return (


    <div className="bg-blue-100 flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 to-blue-900 font-poppins p-4">
      <AnimatePresence>
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 right-4 md:top-10 md:right-10 flex bg-white rounded shadow-lg border border-gray-100 w-[90%] md:w-80 z-50"
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
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row w-full max-w-4xl"
      >
        <div className="w-full md:w-2/5 bg-teal-50 p-6 md:p-8 flex flex-col">
          <div className="flex items-center mb-6 md:mb-8 justify-center md:justify-start">
            <img src={pic} alt="Logo" className="w-13 h-10" />

          </div>

          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full border-2 border-gray-300 flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>

          <div className="relative mb-4">
            <input
              autoComplete="off"
              type="text"
              placeholder="Username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              pattern="^[a-zA-Z\s]+$"

              className="w-full py-3 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zm-4 7a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <div className="relative mb-6">
            <input
              type="email"
              placeholder="Email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              pattern="^[a-zA-Z0-9._%+-]+@wissen\.com$"
              title="Email must be in the format user@wissen.com"
              className="w-full py-3 px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-900 text-white py-2 md:py-3 rounded-full font-medium hover:bg-blue-800 transition duration-300 mb-4"
          >
            SIGN IN
          </button>

          <button
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 text-gray-700 py-2 md:py-3 rounded-full font-medium hover:bg-gray-50 transition duration-300 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#4285F4" />
              <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#34A853" transform="translate(0 4)" />
              <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#FBBC05" transform="translate(0 8)" />
              <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" fill="#EA4335" transform="translate(0 12)" />
            </svg>
            Sign in with Google
          </button>

          <div className="flex justify-center mt-auto">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Right Side - Welcome Screen */}
        <div className="hidden md:flex w-full md:w-3/5 bg-gradient-to-br from-indigo-300 via-indigo-500 to-indigo-700 p-6 md:p-12 flex-col justify-between">
          <nav className="flex justify-between text-white text-sm">

          </nav>

          <div className="flex flex-col items-start">
            <h1 className="text-white text-3xl md:text-5xl font-bold mb-3">Welcome.</h1>
            <p className="text-white text-sm md:text-base text-opacity-80 mb-6 max-w-sm">
              Log in to the Wissen Help Desk portal and manage your support tickets efficiently.
            </p>
            
          </div>


        </div>
      </motion.div>

      {/* Hidden Google Sign-In Button container (maintained for compatibility) */}
      <div id="google-button" className="hidden" />
    </div>
  );
};

export default HomePage;

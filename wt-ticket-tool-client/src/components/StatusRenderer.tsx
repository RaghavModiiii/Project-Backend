import { useState } from "react";
import './ui/button.scss'; 
import { updateDepartmentStatus } from "../api/admin";
import { motion } from "framer-motion";


const StatusRenderer = (props: any) => {

  
  const [newStatus, setNewStatus] = useState(props.value);
  const [isChanged, setIsChanged] = useState(false);
   const [alertMessage, setAlertMessage] = useState<string>("");
      const [showAlert, setShowAlert] = useState<boolean>(false);

  const toggleStatus = () => {
    const updatedStatus = !newStatus;
    setNewStatus(updatedStatus);
    setIsChanged(updatedStatus !== props.value);
  };
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


  const updateStatus = async () => {
  try {
    await updateDepartmentStatus(props.data.emailId, newStatus);  

    setIsChanged(false);

    const updatedRow = { ...props.data, isActive: newStatus };
    props.api.applyTransaction({ update: [updatedRow] });

    triggerAlert(`Status updated successfully for ${props.data.emailId}`);
    window.location.reload(); 
  } catch (error) {
    console.error("Error updating status:", error);
    triggerAlert("Failed to update status. Please try again.");
  }
};

  return (
    <div className="flex items-center gap-4">
      <label className="toggle-container">
        <input
          type="checkbox"
          checked={newStatus}
          onChange={toggleStatus}
          className="toggle-checkbox"
        />
        <span className="toggle-switch"></span>
      </label>

      <span className="status-text">{newStatus ? "Active" : "Inactive"}</span>

      {isChanged && (
        <button
          onClick={updateStatus}
          className="px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 transition"
        >
          Update
        </button>
      )}
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
      
    </div>
  );
};

export default StatusRenderer;

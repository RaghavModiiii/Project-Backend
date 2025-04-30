import React, { useEffect, useState } from "react";
import { uploadAttachment } from "../api/attachment";
import { createTicket } from "../api/ticketApi";
import { AnimatePresence, motion } from "framer-motion";

interface CreateTicketModalProps {
  show: boolean;
  ticket: any;
  onClose: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  show,
  ticket,
  onClose,
  onChange,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // Triggers an alert with a message
  const triggerAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  // Sets the default priority for the ticket
  useEffect(() => {
    if (!ticket.priority) {
      ticket.priority = "Low";
    }
  }, [ticket]);

  // Handles the submission of the ticket
  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!ticket.title && !ticket.description && !ticket.department) {
      triggerAlert("Please fill in all required fields before submitting.");
      return;
    }
    if (!ticket.title) {
      triggerAlert("Please fill in the title before submitting.");
      return;
    }
    if (!ticket.description) {
      triggerAlert("Please fill in the description before submitting.");
      return;
    }
    if (!ticket.department) {
      triggerAlert("Please fill in the department before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);

      const createdBy = localStorage.getItem("email");

      const ticketData = {
        ...ticket,
        createdBy: createdBy || "Unknown User",
      };

      const response = await createTicket(ticketData);
      window.location.reload();

      if (response && response.ticketId) {
        if (attachment) {
          await uploadAttachment(response.ticketId, attachment);
        }
      }
      onClose();
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handles the closing of the alert
  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  // Handles file selection for attachments
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachment(e.target.files[0]);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-0 rounded-xl shadow-2xl w-4/5 max-w-4xl h-4/5 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white flex justify-between items-center rounded-t-xl">
          <h2 className="text-2xl font-bold text-blue-900">Create Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-gray-400 font-semibold mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              placeholder="Enter ticket title"
              value={ticket.title}
              onChange={onChange}
              className="w-full border placeholder-gray-700 border-gray-300 p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-400 font-semibold mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              placeholder="Describe the issue..."
              value={ticket.description}
              onChange={onChange}
              rows={3}
              className="w-full border placeholder-gray-700 border-gray-300 p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-gray-400 font-semibold mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="department"
              value={ticket.department}
              onChange={onChange}
              className="w-full border border-gray-400 text-gray-700 p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" className="text-gray-700">
                Select Department
              </option>
              <option value="HR">HR</option>
              <option value="IT">IT</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-gray-400 font-semibold mb-2">
              Attach File
            </label>
            <input
              type="file"
              name="attachments"
              onChange={handleFileChange}
              className="w-full border placeholder-gray-700 border-gray-300 text-gray-400 p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-gray-400 font-semibold mb-2">
              Priority <span className="text-red-500">*</span>
            </label>
            <select
              name="priority"
              value={ticket.priority}
              onChange={onChange}
              className="w-full border border-gray-400 text-gray-700 p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-gray-400 font-semibold mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={ticket.dueDate}
              min={new Date(new Date().setDate(new Date().getDate() + 7))
                .toISOString()
                .split("T")[0]}
              onChange={onChange}
              className="w-full border border-gray-400 text-gray-700 p-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-6 border-t border-gray-200 flex justify-end space-x-4 bg-white rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-md bg-gray-600 text-white transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-md flex items-center justify-center ${
              isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-900"
            } text-white transition duration-200`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  ></path>
                </svg>
                <span>Creating...</span>
              </div>
            ) : (
              "Create"
            )}
          </button>
        </div>
        <AnimatePresence>
          {showAlert && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="absolute top-10 right-10 flex bg-gray-100 rounded shadow-lg border border-gray-100 w-80 z-50"
            >
              <div className="flex items-center justify-center bg-orange-500 px-3 rounded-l">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93"
                  />
                </svg>
              </div>
              <div className="flex-1 px-4 py-3">
                <div className="flex justify-between items-start">
                  <p className="text-gray-800 font-semibold">Alert!</p>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={handleCloseAlert}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-1">{alertMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateTicketModal;
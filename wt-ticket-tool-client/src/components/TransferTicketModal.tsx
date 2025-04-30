import React, { useState, useEffect } from 'react';
import { getUserDepartment, getUsersOfDepartment } from '../api/getUserDepartment';
import Select from 'react-select';
import { motion } from "framer-motion";


interface TransferTicketModalProps {
  onSubmit: (email: string, comment: string) => void;
  onClose: () => void;
}
interface User {
  email: string;
  name: string;
}


const TransferTicketModal: React.FC<TransferTicketModalProps> = ({ onSubmit, onClose }) => {
  const [email, setEmail] = useState('');
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
  const [comment, setComment] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userEmail = localStorage.getItem("email");
        if (!userEmail) {
          triggerAlert("No email found in local storage.");
          
          return;
        }

        const { department } = await getUserDepartment(userEmail);

        if (!department) {
          triggerAlert("No department found for the user.");
          return;
        }

        const data = await getUsersOfDepartment(department);
        console.log(data);

        const mappedUsers: User[] = data
          .filter((user: any) =>
            user.emailId &&
            user.isActive &&
            user.emailId !== userEmail
          )
          .map((user: any) => ({
            email: user.emailId,
            name: user.emailId.split("@")[0], // You can customize this if name becomes available
          }));
        console.log(mappedUsers);

        setUsers(mappedUsers);



      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
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

  const userOptions = users.map((user) => ({
    value: user.email,
    label: `${user.name} (${user.email})`
  }));

  const handleUserChange = (selectedOption: any) => {
    setEmail(selectedOption?.value || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      triggerAlert('Please select a user.');
      return;
    }
    if(!comment.trim()) {
      triggerAlert('Please add a comment.');
      return;
    }
    onSubmit(email, comment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-blue-800 mb-4">Transfer Ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
            <Select
              options={userOptions}
              onChange={handleUserChange}
              placeholder="Search or select a user"
              isClearable
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2"
              rows={3}
              placeholder="Add a comment (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Transfer
            </button>
          </div>
        </form>
      </div>
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

export default TransferTicketModal;

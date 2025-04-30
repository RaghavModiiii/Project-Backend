import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Ticket } from "../api/ticketApi";
import {  closeTicket, assignTicket, reopenTicket, transferTicket } from '../api/ticketApi';
import CommentsSection from '../components/CommentsSection';
import { motion } from "framer-motion";

import AttachmentsSection from '../components/AttachmentsSection';
import TransferTicketModal from '../components/TransferTicketModal';
import { addCommentToTicket, CommentDto } from '../api/comments';
import { useTicket } from '../api/ticketApi'; 

const TicketDetailsPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState<string>("");
    const [showAlert, setShowAlert] = useState<boolean>(false);
  const [showTransferModal, setShowTransferModal] = useState(false);


  const loggedInEmail = localStorage.getItem("email"); 

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

  const handleAssign = async (ticket: Ticket) => {
    const email = localStorage.getItem("email");
    console.log(email);
    
    
    if (!email) {
      triggerAlert("User email not found.");
      return;
    }
  
    try {
      const updatedTicket = await assignTicket(ticket.ticketId, email);
      triggerAlert(`Ticket assigned to ${updatedTicket.assignTo}`);
    } catch (error) {
      console.error("Error assigning ticket:", error);
      triggerAlert("Failed to assign ticket.");
    }
  };


  const { ticket, getTicketById } = useTicket();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await getTicketById(ticketId!);
      setLoading(false);
    };
    fetch();
  }, [ticketId]);
  

  const handleClose = () => {
    navigate('/dashboard');
  };

  const handleStatusChange = async () => {
    if (!ticket) return;

    const userEmail = localStorage.getItem("email");
    if (userEmail !== ticket.assignTo) {
      alert("You are not authorized to close this ticket.");
      return;
    }

    const confirmClose = window.confirm("Are you sure you want to close this ticket?");
  if (!confirmClose) return;

    try {
      await closeTicket(ticket.ticketId);

      alert("You have closed the ticket.");
      navigate('/dashboard');
      
    } catch (error) {
      console.error("Failed to close ticket:", error);
      alert("Failed to close ticket.");
    }
  };
  const handleClaimTicket = async () => {
    if (!ticket) return;
    const email = localStorage.getItem("email");
    console.log(email);
        
    

    const confirmClaim = window.confirm("Are you sure you want to claim this ticket?");

    if (confirmClaim) {
      try {
        await handleAssign(ticket);
        window.location.reload();
      } catch (error) {
        console.error("Failed to claim ticket:", error);
        alert("Failed to claim ticket.");
      }
    }
  };

  const handleReopenTicket = async () => {
    if (!ticket) return;

  const confirmReopen = window.confirm("Are you sure you want to reopen this ticket?");
  if (!confirmReopen) {
    return; 
  }

    try {
      await reopenTicket(ticket.ticketId);
      alert("Ticket has been reopened.");
    } catch (error) {
      console.error("Failed to reopen ticket:", error);
      alert("Failed to reopen ticket.");
    }
  };
  const handleTransferSubmit = async (email: string, comment: string) => {
    try {
      if (!ticket) return;
      if(!comment.trim()) return;
      const emailFromStorage = localStorage.getItem("email");
if (!emailFromStorage) return;
      const commentDto : CommentDto ={
        comment: comment,
        commentedBy : emailFromStorage,
      };
      console.log(emailFromStorage);
      
    
      await addCommentToTicket(ticket.ticketId,commentDto);
      

      await transferTicket(ticket.ticketId, { email, comment });

      alert(`Ticket transferred to ${email}`);
      setShowTransferModal(false);
      navigate('/dashboard');
    } catch (error) {
      console.error("Failed to transfer ticket:", error);
      alert("Transfer failed.");
    }
  };




  if (loading) return <div className="text-center py-10 text-gray-600">Loading ticket details...</div>;
  if (!ticket) return <div className="text-center py-10 text-red-600">No ticket found.</div>;

  return (
    <div className="fixed inset-0 bg-gray-100 bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden h-[90vh] flex flex-col">

        {/* Header */}
        <div className="sticky top-0 bg-white py-4 px-8 z-10 shadow-md flex justify-between items-center">
          <h4 className="text-2xl font-bold text-blue-900">
            {ticket.ticketId}: {ticket.title}
          </h4>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Form Section */}
        <div className="overflow-y-auto px-8 py-6 flex-1">
          <form className="space-y-6">
            {/* Department */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Department</label>
              <input
                type="text"
                value={ticket.department}
                readOnly
                className="w-full border border-gray-300 p-3 rounded-md bg-gray-100"
              />
            </div>

            {/* Priority */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Priority</label>
              <input
                type="text"
                value={ticket.priority}
                readOnly
                className="w-full border border-gray-300 p-3 rounded-md bg-gray-100"
              />
            </div>

            {/* Status (Changeable) */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Status</label>
              <div className="flex gap-4 items-center">
                <input
                  type="text"
                  value={ticket.status}
                  readOnly
                  className="w-full border border-gray-300 p-3 rounded-md bg-gray-100"
                />
              </div>
            </div>

            {/* Assigned To */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Assigned To</label>
              <input
                type="text"
                value={ticket.assignTo || 'Unassigned'}
                readOnly
                className="w-full border border-gray-300 p-3 rounded-md bg-gray-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Description</label>
              <textarea
                value={ticket.description}
                readOnly
                rows={3}
                className="w-full border border-gray-300 p-3 rounded-md bg-gray-100"
              ></textarea>
            </div>
          </form>

          {/* Attachments Section */}
          <AttachmentsSection ticketId={ticketId!} />
          <br />
          {ticket.assignTo === loggedInEmail && ticket.status!=='Closed' && (
            <button

              onClick={() => setShowTransferModal(true)}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition "
            >
              Transfer Ticket
            </button>
          )}

          {showTransferModal  && (
            <TransferTicketModal
              onSubmit={handleTransferSubmit} // ✅ this is what was missing
              onClose={() => setShowTransferModal(false)}
            />
          )}




          {/* Comments Section */}
          <div className="mt-12">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Comments</h3>
            <CommentsSection ticketId={ticketId!} />

            {ticket.assignTo === loggedInEmail && ticket.status === "Assigned" && (
              <button
                onClick={handleStatusChange}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Close Ticket
              </button>
            )}

            {ticket.status === "Open" && ticket.createdBy !== loggedInEmail && !ticket.assignTo && (
              <button
                onClick={handleClaimTicket}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Claim Ticket
              </button>
            )}
            <br />

            {ticket.status === "Closed" && ticket.createdBy === loggedInEmail && (
              <button

                onClick={handleReopenTicket}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition "
              >
                Reopen Ticket
              </button>
            )}
          </div>

        </div>
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

export default TicketDetailsPage;

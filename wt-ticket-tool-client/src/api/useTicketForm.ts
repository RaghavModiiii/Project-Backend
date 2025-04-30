import { useState } from "react";

/**
 * Custom hook to manage the state and behavior of a ticket form.
 * @param initialState - The initial state of the ticket form.
 * @returns An object containing the ticket state and form handlers.
 */
export const useTicketForm = (initialState = {
  ticketId: "",
  title: "",
  description: "",
  department: "",
  priority: "",
  dueDate: "",
  attachments: null as File | null,
}) => {
  const [newTicket, setNewTicket] = useState(initialState);

  /**
   * Handles changes to input, select, or textarea fields in the form.
   */
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let dueInDays = 7;

    if (value === "High") dueInDays = 3;
    else if (value === "Medium") dueInDays = 5;

    const today = new Date();
    today.setDate(today.getDate() + dueInDays);

    const dueDate = today.toISOString().split("T")[0];

    setNewTicket((prevTicket) => ({
      ...prevTicket,
      [name]: value,
      dueDate: dueDate,
    }));
  };

  /**
   * Handles file selection for the attachments field.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setNewTicket((prevTicket) => ({
      ...prevTicket,
      attachments: file,
    }));
  };

  /**
   * Resets the form to its initial state.
   */
  const resetForm = () => {
    setNewTicket(initialState);
  };

  return {
    newTicket,
    handleInputChange,
    handleFileChange,
    resetForm,
    setNewTicket,
  };
};

/**
 * Submits feedback for a specific ticket.
 * @param feedbackToSubmit - The feedback data to be submitted.
 * @param ticketIdFromUrl - The ID of the ticket.
 * @returns A promise that resolves to the server response.
 */
export const submitFeedback = async (feedbackToSubmit: any, ticketIdFromUrl: string) => {
  const response = await fetch(`http://localhost:8080/api/feedback/submit/${ticketIdFromUrl}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedbackToSubmit),
  });

  if (!response.ok) {
    throw new Error("Failed to submit feedback");
  }

  return response;
};
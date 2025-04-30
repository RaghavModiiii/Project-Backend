import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { fetchTicketById } from "../api/ticketApi";
import { Ticket } from "../api/ticketApi";
import { submitFeedback } from "../api/useTicketForm";
import logo from "../assets/Logo-1.png"

const FeedbackForm = () => {
  // Hook to handle navigation
  const navigate = useNavigate();

  // Extract ticket ID from URL
  const [searchParams] = useSearchParams();
  const ticketIdFromUrl = searchParams.get("ticketId") || "";

  // State to store ticket details
  const [ticket, setTicket] = useState<Ticket | null>(null);

  // State to store feedback form data
  const [feedback, setFeedback] = useState({
    assigneeEmail: "",
    createdBy: "",
    rating: "",
    comments: "",
  });

  // Load ticket details when the component mounts
  useEffect(() => {
    const loadTicket = async () => {
      try {
        if (!ticketIdFromUrl) {
          alert("No Ticket ID provided. Redirecting...");
          navigate("/");
          return;
        }
        const data = await fetchTicketById(ticketIdFromUrl);
        setTicket(data);
      } catch (error) {
        console.error("Error loading ticket:", error);
      }
    };

    loadTicket();
  }, [ticketIdFromUrl, navigate]);

  // Handles changes to form inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFeedback((prev) => ({ ...prev, [name]: value }));
  };

  // Handles form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const feedbackToSubmit = {
        ...feedback,
        assigneeEmail: ticket?.assignTo || "",
        createdBy: ticket?.createdBy || "",
      };
      await submitFeedback(feedbackToSubmit, ticketIdFromUrl);

      alert("Feedback submitted successfully!");
      window.close();
      setFeedback({
        assigneeEmail: ticket?.assignTo || "",
        createdBy: ticket?.createdBy || "",
        rating: "",
        comments: "",
      });
    } catch (error) {
      alert("Please fill all the fields");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-blue-400 p-6">
  <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full border border-gray-200">
    <div className="border-b border-gray-300 pb-5 mb-6">
       <div className="flex items-center justify-between">
      <h2 className="text-3xl font-semibold text-gray-800">Feedback Submission</h2>
      <img src="/src/assets/Logo1.png" alt="Logo" className="w-[170px] h-auto" />
    </div>
      
      <p className="text-sm text-gray-500 mt-1">
        Please provide your evaluation of the service received.
      </p>
    </div>

    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="ticketId" className="block text-sm font-medium text-gray-700">
            Ticket Reference
          </label>
          <input
            type="text"
            id="ticketId"
            name="ticketId"
            value={ticketIdFromUrl}
            readOnly
            className="w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md text-sm text-gray-600 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="assigneeEmail" className="block text-sm font-medium text-gray-700">
            Assignee
          </label>
          <input
            type="email"
            id="assigneeEmail"
            name="assigneeEmail"
            value={ticket?.assignTo || ""}
            readOnly
            className="w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md text-sm text-gray-600 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="createdBy" className="block text-sm font-medium text-gray-700">
          Request Initiated By
        </label>
        <input
          type="email"
          id="createdBy"
          name="createdBy"
          value={ticket?.createdBy || ""}
          readOnly
          className="w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md text-sm text-gray-600 focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
          Service Quality Rating
        </label>
        <div className="flex items-center justify-between max-w-md mx-auto gap-4">
          {[1, 2, 3, 4, 5].map((value) => (
            <div key={value} className="flex flex-col items-center">
              <input
                type="radio"
                id={`rating-${value}`}
                name="rating"
                value={value}
                checked={parseInt(feedback.rating) === value}
                onChange={handleChange}
                className="h-5 w-5 text-blue-700 focus:ring-blue-500"
              />
              <label htmlFor={`rating-${value}`} className="mt-1 text-sm text-gray-700">
                {value}
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>Unsatisfactory</span>
          <span>Excellent</span>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
          Additional Comments
        </label>
        <textarea
          id="comments"
          name="comments"
          value={feedback.comments}
          onChange={handleChange}
          rows={4}
          placeholder="Please provide any additional feedback about your experience..."
          className="w-full py-2 px-3 border border-gray-300 rounded-md text-sm text-gray-700 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full py-2 px-4 rounded-md text-sm font-medium text-white bg-blue-900 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          Submit Feedback
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center mt-4">
        Thank you for taking the time to provide your feedback. Your input helps us improve our services.
      </p>
    </form>
  </div>
</div>

  );
};

export default FeedbackForm;
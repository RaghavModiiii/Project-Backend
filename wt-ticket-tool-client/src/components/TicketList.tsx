import React from "react";
import { Ticket } from "../api/ticketApi";

interface TicketListProps {
  tickets: Ticket[];
  email: string;
  onSelectTicket: (ticket: Ticket) => void;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, email, onSelectTicket }) => {
  return (
    <div className="mt-6 bg-white p-4 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Your Tickets</h2>
      <ul className="divide-y divide-gray-300">
        {tickets.length > 0 ? (
          tickets.map(ticket =>
            (ticket.createdBy === email || ticket.assignTo === email) && (
              <li
                key={ticket.ticketId}
                className="py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 px-4 rounded transition"
                onClick={() => onSelectTicket(ticket)}
              >
                <span className="text-gray-700 font-medium">{ticket.title}</span>
                <span className="text-sm text-gray-500">
                  {ticket.createdBy === email ? "Created" : "Assigned"}
                </span>
              </li>
            )
          )
        ) : (
          <p className="text-gray-500">No tickets found.</p>
        )}
      </ul>
    </div>
  );
};

export default TicketList;

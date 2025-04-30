import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import { fetchTicketByStatus, Ticket } from "../api/ticketApi";
import Notifications from "./Notifications";

const COLORS = ["#facc15", "#10b981", "#ef4444"];

interface TopBarProps {
  name: string;
  email: string;
}

interface TicketStats {
  status: string;
  count: number;
}

const TopBar: React.FC<TopBarProps> = ({ name, email }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = React.useState(false);

  const [ticketStats, setTicketStats] = useState<TicketStats[]>([
    { status: "opened", count: 0 },
    { status: "resolved", count: 0 },
    { status: "closed", count: 0 },
  ]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/");
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  useEffect(() => {
    const statuses = ["Open", "Assigned", "Closed"];
    const fetchStats = async () => {
      let response: Ticket[] = [];
      const updatedStats = await Promise.all(
        statuses.map(async (status) => {
          response = await fetchTicketByStatus(status);
          if (status == "Open") {
            response = response.filter((ticket) => ticket.createdBy === localStorage.getItem("email"));
          }
          if (status == "Assigned") {
            response = response.filter((ticket) => ticket.assignTo === localStorage.getItem("email") || ticket.createdBy === localStorage.getItem("email"));
          }
          if (status == "Closed") {
            response = response.filter((ticket) => ticket.createdBy === localStorage.getItem("email") || ticket.assignTo === localStorage.getItem("email"));
          }
          return { status, count: response.length };
        })
      );
      setTicketStats(updatedStats);
    };

    fetchStats();
  }, []);

  return (
    <div className="flex justify-between items-center bg-white px-6 py-4 shadow-lg rounded-2xl border border-gray-100">
      <h1 className="text-3xl font-extrabold text-blue-900 flex items-center gap-4 px-0">
        <img src="/src/assets/Logo1.png" alt="Logo" className="w-[200px] h-auto" />
      </h1>

      <div className="relative">

        <div className="flex items-center space-x-3 cursor-pointer">
          <Notifications userEmail={email} />
          <img
            src={`https://ui-avatars.com/api/?name=${name}`}
            alt="User avatar"
            onClick={toggleDropdown}
            className="w-10 h-10 rounded-full"
          />
          <p onClick={toggleDropdown} className="text-sm text-gray-700 font-medium">{name}</p>
        </div>
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg p-4 z-50">
            <p className="font-semibold text-blue-800">{name}</p>
            <p className="text-sm text-gray-500 mb-3">{email}</p>
            <hr className="my-2" />

            <div className="space-y-2">
              <div className="w-full text-left text-gray-700 -700">
              Ticket History
              </div>
              <div>
                {ticketStats.map((stat, index) => (
                  <div key={index} className="flex justify-between items-center mb-1">
                    <span className="capitalize">{stat.status}</span>
                    <span>{stat.count}</span>
                  </div>
                ))}
              </div>
              <div className="w-full h-44 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ticketStats}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      label
                    >
                      {ticketStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <button className="w-full text-left text-red-500 hover:text-red-700" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopBar;
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";

import { ColDef, GridApi, RowClickedEvent } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  fetchTicketByStatus,
  fetchTicketUniqueStatus,
  getTicketsByDepartment,
} from "../api/ticketApi";
import CreateTicketModal from "../components/CreateTicketModal";
import { getUserDepartment } from "../api/getUserDepartment";
import { Ticket } from "../api/ticketApi";
import { useTicketForm } from "../api/useTicketForm";
import { useMemo } from "react"; // ✅ Import useMemo
import 'react-date-range/dist/styles.css'; // Main style
import 'react-date-range/dist/theme/default.css'; // Theme style
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./styles.css"

interface User {
  name: string,
  email: string,
}

interface HeaderProps {
  user: User | null;
}


const Header: React.FC<HeaderProps> = ({ user }) => {
  const navigate = useNavigate();

  const [department, setDepartment] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>("Assigned");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusTabs, setStatusTabs] = useState<string[]>([]);
  const [hasDepartmentTickets, setHasDepartmentTickets] = useState(false);
  const [selectedSubTab, setSelectedSubTab] = useState<"Department" | "Self">("Department");
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() - 1)));
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());
  const [dateRangePreset, setDateRangePreset] = useState("1y");
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {

    fetchTicketStatuses();

    fetchUserDept();
  }, [department, user]);

  useEffect(() => {
    if (department) {
      checkDeptTickets();
    }
  }, [department]);


  const fetchTicketStatuses = async () => {
    try {
      const statuses = await fetchTicketUniqueStatus();
      setStatusTabs(statuses || []);
    } catch (error) {
      console.error("Error fetching ticket statuses:", error);
    }
  }
  const fetchUserDept = async () => {

    try {
      if (user) {
        const userDept = await getUserDepartment(user.email);
        if (userDept?.department == undefined || userDept?.department == null) {
          console.log("User Don't have department");
        }
        else {
          setDepartment(userDept.department);
        }

      }
    } catch (error) {
      console.error("Error fetching user department:", error);
    }

  };
  const checkDeptTickets = async () => {
    console.log(department);

    if (!department) return;
    try {
      const departmentTickets = await getTicketsByDepartment(department);
      if (user) {
        const filteredTickets = departmentTickets.filter(
          (ticket) => ticket.status === "Open" && ticket.createdBy !== user.email
        );
        setHasDepartmentTickets(filteredTickets.length > 0);
      }
    } catch (error) {
      console.error("Error checking department tickets:", error);
    }
  };

  useEffect(() => {
    if (!selectedTab) return;
    fetchTickets();
  }, [selectedTab, department, selectedSubTab]);

  const handleTabChange = (tab: string) => {
    setSelectedTab(tab);
  };

  const TabButton = ({ tab, label }: { tab: string; label: string }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`px-4 py-2 rounded-full transition ${selectedTab === tab
        ? 'bg-blue-900 text-white'
        : 'bg-gray-200 text-gray-700'
        }`}
    >
      {label}
    </button>
  );
  const fetchTickets = async () => {
    setLoading(true);
    try {
      if (user) {
        let response: Ticket[] = [];

        if (selectedTab === "department") {
          response = await getTicketsByDepartment(department);
          response = response.filter((ticket) => ticket.createdBy !== user.email && ticket.status === "Open");

        } else {
          response = await fetchTicketByStatus(selectedTab);

          if (selectedTab === "Assigned" || selectedTab === "Closed") {
            if (selectedSubTab === "Department") {
              response = response.filter((ticket) => ticket.assignTo === user.email);
            } else if (selectedSubTab === "Self") {
              response = response.filter((ticket) => ticket.createdBy === user.email);
            }
          }
          else if (selectedTab === "Open") {
            response = response.filter((ticket) => ticket.createdBy === user.email);
          }
        }

        setTickets(response);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const { newTicket, handleInputChange, handleFileChange } =
    useTicketForm({
      ticketId: "",
      title: "",
      description: "",
      department: "",
      priority: "",
      dueDate: "",
      attachments: null,
    });

  const getColumnDefs = () => {
    return columnDefs.filter(col => {
      if (selectedTab === 'Open') {
        return col.field !== 'createdBy' && col.field !== 'assignTo' && col.field !== 'updatedBy';
      }
      if (selectedTab === 'department') {
        return col.field !== 'department' && col.field !== 'updatedBy';
      }
      if (selectedTab === 'Closed') {
        return col.field !== 'updatedBy';
      }

      return true;
    });
  };

  const handleRowClick = (event: RowClickedEvent) => {
    navigate(`/ticket/${event.data.ticketId}`);
  };

  const columnDefs: ColDef<Ticket>[] = [
    {
      headerName: 'ID', floatingFilter: true,
      filter: "agTextColumnFilter", field: 'ticketId', width: 235, cellRenderer: (params: any) => <span >
        {params.value}
      </span>
    },
    {
      headerName: "Title", floatingFilter: true,
      field: "title", width: 235, filter: "agTextColumnFilter",
    },
    {
      headerName: "Priority",
      field: "priority", width: 235,
    },
    {
      headerName: "Department", floatingFilter: true
      , filter: "agTextColumnFilter",
      field: "department", width: 235,
    },
    {
      headerName: "Created Date", floatingFilter: true,
      field: "createdDate", width: 235,
      sort: "desc",

      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).replace(/ /g, '-');
      },
    },
    {
      headerName: "Due Date", floatingFilter: true,
      field: "dueDate", width: 235,
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }).replace(/ /g, '-');
      },
    },
    {
      headerName: "Created By", floatingFilter: true,
      field: "createdBy", width: 235,
    },
    {
      headerName: "Updated By", floatingFilter: true,
      field: "updatedBy", width: 235,
    },
    {
      headerName: "Assigned To",
      floatingFilter: true,
      field: "assignTo",
      width: 230,
      valueGetter: (params) => params.data?.assignTo || "Unassigned",
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (!ticket.createdDate) return false;
      const ticketDate = new Date(ticket.createdDate);

      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const matchesDate = ticketDate >= start && ticketDate <= end;
      const matchesSearch =
        ticket.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.ticketId?.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.department?.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.createdDate?.toLowerCase().includes(searchText.toLowerCase()) ||
        ticket.createdBy?.toLowerCase().includes(searchText.toLowerCase());
      return matchesDate && matchesSearch;
    });
  }, [tickets, endDate, startDate, searchText]);

  const gridApiRef = useRef<GridApi<any> | null>(null);

  const onGridReady = useCallback((params: { api: GridApi }) => {
    gridApiRef.current = params.api;
  }, []);

  useEffect(() => {
    if (showCalendar) {
      setTempStartDate(startDate);
      setTempEndDate(endDate);
    }
  }, [showCalendar]);

  const handleClear = () => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    setStartDate(oneYearAgo);
    setEndDate(today);
    setTempStartDate(oneYearAgo);
    setTempEndDate(today);
    setShowCalendar(false);
    setDateRangePreset("1y");
  };

  const handleApply = () => {
    if (!tempStartDate || !tempEndDate) return;

    const start = new Date(tempStartDate);
    start.setHours(0, 0, 0, 0); // Start of the day

    const end = new Date(tempEndDate);
    end.setHours(23, 59, 59, 999); // End of the day

    setStartDate(start);
    setEndDate(end);
    setShowCalendar(false);

  };
  const handlePresetChange = (range: string) => {
    const now = new Date();
    const end = new Date();
    let start = new Date();

    switch (range) {

      case "Custom":
        break;
      case "7d":
        start.setDate(now.getDate() - 7);
        break;
      case "15d":
        start.setDate(now.getDate() - 15);
        break;
      case "30d":
        start.setMonth(now.getMonth() - 1);
        break;
      case "1y":
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        break;
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    setTempStartDate(start);
    setTempEndDate(end);
    setStartDate(start); // Immediately apply range
    setEndDate(end);
    setDateRangePreset(range);
  };

  return (
    <div className="flex flex-col h-screen w-screen relative overflow-hidden">
      {/* Header section */}
      <div className="flex flex-wrap gap-2 sm:gap-4 p-4 justify-center  border-gray-200 bg-white z-10">
        {/* Status buttons */}
        {statusTabs.length > 0&& statusTabs.map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base transition ${selectedTab === tab ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-700"
              }`}
          >
            {tab === "Assigned" ? "In Progress" : tab}
          </button>
        ))}
        {department && hasDepartmentTickets && (
          <TabButton tab="department" label={department} />
        )}
        <div className="relative ml-auto">

          <div className="relative ml-auto hidden sm:flex items-center gap-2">
            <select
              value={dateRangePreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="ml-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded shadow-sm"
            >
              <option value="1y">Last 1 Year</option>
              <option value="30d">Last 30 Days</option>
              <option value="15d">Last 15 Days</option>
              <option value="7d">Last 7 Days</option>
              <option value="Custom">Custom-Range</option>
            </select>
            <button
              onClick={() => setShowCalendar(!showCalendar)}
              className="border border-gray-300 px-4 py-2 rounded bg-white shadow-sm"
            >
              📅 {tempStartDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })} - {tempEndDate.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}            </button>

            <button
              onClick={handleClear}
              className="px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition"
            >
              Clear
            </button>

            <button
              onClick={handleApply}

              className="px-3 py-2 text-sm bg-emerald-500 text-white border border-emerald-600 rounded hover:bg-emerald-600 transition"
            >
              Apply
            </button>
          </div>
          {showCalendar && (
            <div className="absolute right-0 mt-2 z-50 bg-white border shadow rounded-md  gap-4 p-4 hidden sm:flex">
              <div>
                <label className="block mb-1 font-semibold text-sm">Start Date</label>
                <ReactDatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => {
                    setDateRangePreset("Custom");
                    if (date) setTempStartDate(date);
                    if (date && tempEndDate && date > tempEndDate) setTempEndDate(date);
                  }}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  inline
                  onCalendarClose={() => setShowCalendar(false)}
                  dayClassName={(date) => {
                    if (
                      tempStartDate &&
                      tempEndDate &&
                      date > tempStartDate &&
                      date < tempEndDate
                    ) {
                      return "custom-range-day";
                    }
                    if (tempStartDate && date.toDateString() === tempStartDate.toDateString()) {
                      return "custom-start-day";
                    }
                    return "";
                  }}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold text-sm">End Date</label>
                <ReactDatePicker

                  selected={endDate}
                  onChange={(date: Date | null) => {
                    setDateRangePreset("Custom");

                    if (date) setTempEndDate(date);
                    if (date && tempStartDate && date < tempStartDate) setTempStartDate(date);
                  }}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  maxDate={today}
                  inline
                  onCalendarClose={() => setShowCalendar(false)}
                  dayClassName={(date) => {
                    const normalizedDate = new Date(date);
                    normalizedDate.setHours(0, 0, 0, 0);
                    if (tempEndDate.toDateString() == normalizedDate.toDateString()) {
                      return "custom-start-day";
                    }
                    if (normalizedDate > tempEndDate) {
                      return "";
                    }
                    if (
                      tempStartDate &&
                      tempEndDate &&
                      date > tempStartDate &&
                      date < tempEndDate
                    ) {

                      return "custom-range-day";
                    }
                    return "";
                  }}

                />
              </div>

            </div>
          )
          }

        </div>
      </div>

      <div className="w-[95%] mx-auto flex items-center justify-between p-2">
        <div className="flex gap-2">
          {["Assigned", "Closed"].includes(selectedTab) ? (
            ["Department", "Self"].map((subTab) => (
              <button
                key={subTab}
                onClick={() => setSelectedSubTab(subTab as "Department" | "Self")}
                className={`px-3 py-1 rounded-full text-sm transition ${selectedSubTab === subTab
                  ? "bg-blue-900 text-white" : "bg-gray-300 text-gray-700"
                  }`}
              >
                {subTab}
              </button>
            ))
          ) : (
            <div className="w-[1px]" />
          )}
        </div>



        <input
          type="text"
          placeholder="Search tickets..."
          value={searchText}
          onChange={handleSearchChange}
          className="border border-gray-400 p-2 rounded-md focus:ring-2 focus:ring-blue-500 w-64"
        />


      </div>

      {/* Ag-Grid Section */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            Loading tickets...
          </div>
        ) : tickets.length > 0 ? (
          <div className="ag-theme-alpine h-[83%] w-[95%] mx-auto">
            <AgGridReact
              onGridReady={onGridReady}
              rowData={filteredTickets}
              columnDefs={getColumnDefs()}
              onRowClicked={handleRowClick}
              rowClassRules={{
                "ag-row-hover": () => true,
              }}
              defaultColDef={{
                sortable: true,
                resizable: true,
              }}
              animateRows={true}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50]}


            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            No tickets found.
          </div>
        )}
      </div>
      {/* Ticket Modal */}
      {showModal && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40 z-50">
          <CreateTicketModal
            show={true}
            ticket={newTicket}
            onChange={handleInputChange}
            onFileChange={handleFileChange}
            onClose={() => setShowModal(false)}
          />

        </div>

      )}
      
      <button
        onClick={() => setShowModal(true)}

        className="fixed bottom-20 right-20 w-14 h-14 rounded-full shadow-lg bg-emerald-600 text-white transition text-3xl z-60 text-center leading-none flex items-center justify-center"
      >
        <span className="relative bottom-0.5">+</span>
      </button>

    </div>
  );
};

export default Header;

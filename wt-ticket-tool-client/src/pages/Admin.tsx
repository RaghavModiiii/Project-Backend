import { useEffect, useState, useMemo} from "react";
import axios from "axios";
import TopBar from "../components/TopBar";
import { getUser, LocalUser } from "../api/getUser";
import { Department } from "../api/getUserDepartment";
import { motion } from "framer-motion";


import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  ClientSideRowModelModule,
  ColDef,
  ModuleRegistry,
  PaginationModule,
} from "ag-grid-community";
import StatusRenderer from "../components/StatusRenderer";
import { fetchUsers, getAllDepartments } from "../api/admin";
import { useNavigate } from "react-router-dom";

ModuleRegistry.registerModules([ClientSideRowModelModule, PaginationModule]);

const Admin = () => {
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>(localStorage.getItem("selectedTab") || "");
  const [filteredTickets, setFilteredTickets] = useState<Department[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(true);
    const [showAlert, setShowAlert] = useState<boolean>(false);
      const [alertMessage, setAlertMessage] = useState<string>("");
    
  

  const navigate = useNavigate();

 const [user, setUser] = useState<LocalUser | null>(null);
 useEffect(() => {
  const savedTab = localStorage.getItem("selectedTab");
  if (savedTab) {
    setSelectedTab(savedTab);  
  }
}, []);


  useEffect(() => {
  const fetchUserData = async () => {
  const fetchedUser = await getUser();
  console.log(fetchedUser);

  if (fetchedUser == null) {
    if (localStorage.getItem("email") != null) {
      setUser({
        name: localStorage.getItem("name") || "",
        email: localStorage.getItem("email") || "",
        loginMethod: "manual",
      });
    } else {
      navigate("/");
    }
  } else {
    setUser(fetchedUser);
  }
};

    fetchUserData();
}, []);

useEffect(() => {
  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      setDepartments(data);
      
      const savedTab = localStorage.getItem("selectedTab");
        if (savedTab && data.includes(savedTab)) {
          setSelectedTab(savedTab);
        } else if (data.length > 0) {
          setSelectedTab(data[0]);
          localStorage.setItem("selectedTab", data[0]); 
        }
      if (data.length > 0) {
        setSelectedTab(data[0]);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  fetchDepartments();
}, []);

useEffect(() => {
  const getUsers = async () => {
    setLoading(true);
    try {
      const users = await fetchUsers(selectedTab);
      setFilteredTickets(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedTab) {
    getUsers();
  }
}, [selectedTab]);


  const handleTabChange = (department: string) => {
    setSelectedTab(department);
    localStorage.setItem("selectedTab", department); 
  };
   const triggerAlert = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);

    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

 


  const handleAddUser = async () => {
    if (!newEmail.trim()) {
      triggerAlert("Please enter an email!");
      return;
    }

    const emailExists = filteredTickets.some(ticket => ticket.emailId === newEmail);
    if (emailExists) {
    triggerAlert("This email is already present in the department!");
      return;
    }

    try {
      const requestData = {
        emailId: newEmail.trim(),
        department: selectedTab.trim(),
        isActive: true, 
      };

      const response = await axios.post(
        "http://localhost:8080/api/department/adduser",
        requestData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, 

        },
      );

      if (response.data?.success) {
        triggerAlert(response.data.msg);
        setIsModalOpen(false);
        setNewEmail("");
        fetchUsers(selectedTab); 
        window.location.reload();
      } else {
        triggerAlert(response.data?.msg || "Failed to add user.");
      }
    } catch (error: any) {
      console.error("Error adding user:", error);
      triggerAlert
      (error.response?.data?.msg || "An unexpected error occurred.");
    }
  };

  const columnDefs: ColDef<Department>[] = useMemo(
    () => [
      { headerName: "S.No", valueGetter: "node.rowIndex + 1", width: 100, sortable: false },
      { headerName: "Email", field: "emailId", width: 250, sortable: true, filter: true },
      { headerName: "Active", field: "isActive", width: 150, sortable: true, filter: true, cellRenderer: StatusRenderer },
    ],
    []
  );

    const handleCloseAlert = () => {
    setShowAlert(false);
  };


  const defaultColDef = useMemo(
    () => ({
      flex: 1,
      minWidth: 150,
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Top Bar */}
      {user && (
  <div className="fixed top-0 w-full bg-white shadow-md z-50">
    <TopBar name={user.name} email={user.email} />
  </div>
)}

      {/* Main Content */}
      <div className="flex flex-col flex-grow pt-20 px-6 space-y-6 items-center w-full mx-auto">
        {/* Tabs Section */}
        <div className="flex gap-2 p-4 bg-white shadow-md rounded-2xl w-screen justify-center">
          {departments.map((department) => (
            <button
              key={department}
              onClick={() => handleTabChange(department)} 
              className={`px-6 py-2 text-sm font-medium rounded-full transition shadow-md ${
                selectedTab === department ? "bg-blue-900 text-white shadow-md" : "bg-gray-200 text-gray-700"
              }`}
            >
              {department}
            </button>
          ))}
          <div className="flex justify-end w-full max-w-[90%]">
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-auto px-6 py-2 bg-emerald-500 hover:bg-emerald-700 text-white rounded-full shadow-md transition"
            >
              + Add User
            </button>
          </div>
        </div>

        {/* Ag-Grid Section */}
        <div className="ag-theme-alpine w-full max-w-[90%] h-[500px] shadow-lg rounded-2xl overflow-visible mx-auto">
          {!loading ? (
            <AgGridReact
              rowData={filteredTickets}
              columnDefs={columnDefs}
              rowStyle={{ cursor: "pointer" }}
              defaultColDef={defaultColDef}
              animateRows={true}
              pagination={true}
              paginationPageSize={10}
            />
          ) : (
            <p className="text-center mt-5">Loading...</p>
          )}
        </div>
      </div>

      {/* Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Add User to {selectedTab} Department</h2>
            <input
              type="email"
              placeholder="Enter email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
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

export default Admin;

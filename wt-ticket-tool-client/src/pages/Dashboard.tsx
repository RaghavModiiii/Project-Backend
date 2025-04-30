import { useEffect, useState } from "react";
import TopBar from "../components/TopBar";
import { getUser, LocalUser } from "../api/getUser";

import Header from "./Header";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Track loading state
  const [error, setError] = useState<string | null>(null); // Track error state
  const navigate = useNavigate();

 

  useEffect(() => {
  const fetchUser = async () => {
    const localName = localStorage.getItem("name");
    const localEmail = localStorage.getItem("email");
    
    // console.log(localName);
    

    if (localName && localEmail) {
setUser({ name: localName, email: localEmail, loginMethod: "manual" });
      setLoading(false);
      return;
    }

    try {
      const userData = await getUser();
      
      if (userData?.name==undefined || userData.name == null) {
        setError("User not logged in");
        navigate("/");
      } else {
        setUser(userData);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  };

  fetchUser();
}, [navigate]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* TopBar with user info */}
      <TopBar name={user!.name} email={user!.email} />

      {/* Main content */}
      <div className="flex flex-col flex-grow items-center p-6 space-y-6">
        {/* Header with Create Ticket button */}
        <Header user= {user} />
      </div>
    </div>
  );
};

export default Dashboard;

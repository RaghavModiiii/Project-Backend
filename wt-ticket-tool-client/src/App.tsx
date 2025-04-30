import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Dashboard from "./pages/Dashboard";
import TicketDetailsPage from "./pages/TicketDetailsPage";
import Admin from "./pages/Admin";
import 'react-datepicker/dist/react-datepicker.css';
import FeedbackForm from "./pages/FeedbackForm";
import VerifyOtp from "./components/VerifyOtp";


function App() {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/admin" element={<Admin/>}/>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ticket/:ticketId" element={<TicketDetailsPage/>} /> 
        <Route path="/feedback" element={<FeedbackForm />} />

      </Routes>
    </Router>
  );
}

export default App;
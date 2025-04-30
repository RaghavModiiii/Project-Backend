# Frontend
wt-ticket-tool-client using React
# Wissen Ticketing Tool – Client

This is the *React-based frontend* for the Wissen Help Desk. The application features a clean, user-friendly UI themed with *Wissen's official blue and green palette*, and offers an intuitive interface for both end users and administrators.

---

## 🎨 UI Highlights

- Designed with *Wissen’s brand colors* (Blue & Green)
- Responsive layout and interactive components
- Friendly dashboard for easy navigation
- Supports dark/light mode (optional)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

### Steps to Run Locally

1. *Clone the Repository*
   ```bash
   git clone https://github.com/your-org/wissen-ticketing-tool-client.git
   cd wissen-ticketing-tool-client
### Install Dependencies

bash
Copy
Edit
npm install
### Start the Development Server

bash
Copy
Edit
npm start
### 📦 Build for Production
bash
Copy
Edit
npm run build
### Core Features
    
🔐 Authentication

Google Sign-In

Microsoft SSO (Under Development)

🧑‍💼 Admin Dashboard

View all users with:

Active Status (online/offline)

Is Active flag (enabled/disabled accounts)

📝 Ticket Management

View and filter tickets by:

Status: In Progress, Closed, Open

Priority: High, Medium, Low

Due Date (calendar-based view)

Add new tickets with file attachments and descriptions

🗂️ My Tickets

Track your own:

Open Tickets

In Progress Tickets

Closed Tickets

🔔 Notification Panel

Real-time alerts when your tickets are updated or assigned


#Backend

# Wissen Ticketing Tool – Server

This is the *backend* for the Wissen Ticketing Tool, built using *Spring Boot*. It powers the ticketing flow including user actions, comments, notifications, email alerts, attachments, and more.

---

## 🔧 Tech Stack

- Java 17+
- Spring Boot
- PostgreSQL
- Gradle
- Swagger UI
- Docker (optional for deployment)

---

## 🚀 Getting Started

### Prerequisites

- Java 17 or later
- Gradle
- PostgreSQL
- IDE (IntelliJ, VS Code, etc.)

### Setup Instructions

1. *Clone the Repository*
   ```bash
   git clone https://github.com/your-org/wissen-ticketing-tool-server.git
   cd wissen-ticketing-tool-server
  ### Features
  🎫 Ticket Management
Users can create, update, and view their tickets.

👤 Assignee & Transfer
Admin/Assignee can transfer tickets between departments.

💬 Comment System
Add, edit (within 15 mins), and retrieve comments on tickets.

📩 Email Notifications
Real-time email alerts on ticket creation, updates, and transfers.

🔔 In-app Notifications
Users receive in-app alerts for any ticket status or action.

📎 Attachment Support
Upload and view files related to tickets.

📅 Scheduled Tasks

Auto-assign open tickets after 15 mins.

Delete read notifications after 24 hours.

🔐 Authentication

Google Sign-In

Microsoft SSO (Under Development)

### Docker 

docker build -t wissen-ticketing-server .
docker run -p 8080:8080 wissen-ticketing-server

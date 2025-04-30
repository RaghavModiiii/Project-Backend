import React, { useState, useEffect, useCallback } from "react";
import { connectWebSocket, disconnectWebSocket } from "../services/websocketService";
import { NotificationIcon } from "./NotificationIcon";
import { getNotificationsByEmail, Notification } from "../api/notification";


interface NotificationsProps {
  userEmail: string;
}

const Notifications: React.FC<NotificationsProps> = ({ userEmail }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

   
 

  useEffect(() => {
    if (!userEmail) return;

    connectWebSocket(userEmail, (newNotification: Notification) => {
      setNotifications((prev) => [...prev, newNotification]);
    });

    return () => disconnectWebSocket();
  }, [userEmail]);
  const fetchNotifications = useCallback(async () => {
     try {
    const data: Notification[] = await getNotificationsByEmail(userEmail);
    setNotifications(data);
  } catch (error) {
    console.error("Error in fetchNotifications:", error);
  }
  }, [userEmail]);

  useEffect(() => {
    if (userEmail) fetchNotifications();
  }, [userEmail, fetchNotifications]);

  return (
    <div className="relative">
      <NotificationIcon 
        notifications={notifications}
      />
      
    </div>
  );
};

export default Notifications;
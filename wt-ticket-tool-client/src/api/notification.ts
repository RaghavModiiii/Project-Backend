export interface Notification {
  id: number;
  emailId: string;
  message: string;
  read: boolean;
  timestamp: string;
}

/**
 * Marks a notification as read by its ID.
 * @param notificationId - The ID of the notification to mark as read.
 * @returns A promise that resolves to the updated notification data.
 */
export const markAsRead = async (notificationId: number) => {
  try {
    const response = await fetch(`http://localhost:8080/api/notifications/read/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ read: true }),
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error('Failed to mark notification as read');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Fetches notifications for a specific email.
 * @param email - The email address to fetch notifications for.
 * @returns A promise that resolves to an array of notifications.
 */
export const getNotificationsByEmail = async (email: string): Promise<Notification[]> => {
  try {
    const response = await fetch(`http://localhost:8080/api/notifications/${email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return data;
    } catch (parseError) {
      throw new Error("Invalid JSON response from the server");
    }
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};
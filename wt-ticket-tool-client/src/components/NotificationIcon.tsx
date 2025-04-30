import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { Button2 } from "./ui/button2";
import { Notification } from "../api/notification";
import { markAsRead } from "../api/notification";
import MarkAsRead from '@mui/icons-material/MarkEmailReadRounded';

interface NotificationIconProps {
    notifications: Notification[];

    onClick?: () => void;
}


export function NotificationIcon({ notifications }: NotificationIconProps) {
    const [showNotifications, setShowNotifications] = useState(() => {
        const saved = localStorage.getItem("showNotifications");
        return saved === "true";
    });
    const [visibleCount, setVisibleCount] = useState(3);

    const markAllAsRead = () => {
        notifications.map((n) => {
            markAsRead(n.id);
        })
        setVisibleCount(0);

    };
    useEffect(() => {
        localStorage.setItem("showNotifications", String(showNotifications));
    }, [showNotifications]);

    const notificationRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
            setShowNotifications(false);
        }
    };


    const extractTicketId = (message?: string): string | null => {
        if (!message) return null;
        const match = message.match(/REQ\d+/);
        return match ? match[0] : null;
    };

    useEffect(() => {


    });



    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const sortedNotifications = [...notifications].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    const visibleNotifications = sortedNotifications.slice(0, visibleCount);


    return (
        <div className="relative" ref={notificationRef}>
            <Button2 onClick={() => setShowNotifications(!showNotifications)} >

                <Bell className="h-6 w-6 " />

                {visibleNotifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {notifications.length}
                    </span>
                )}
            </Button2>


            {showNotifications && (
                <div className="absolute right-0 mt-2 w-64 rounded-lg bg-white shadow-lg z-50">
                    <div className="p-4 max-h-[550px] bg-white overflow-hidden transition-all duration-300 ease-in-out">
                        <div className="sticky top-0 z-10 bg-white px-4 py-3 border-b border-gray-200">
                            <h3 className="text-lg bg-white font-semibold">Notifications</h3>
                            <MarkAsRead
                                className="absolute top-0 right-0 h-6 w-6 text-gray-500 cursor-pointer"
                                onClick={() => {
                                    markAllAsRead();
                                }}
                            />
                        </div>


                        <div className="overflow-y-auto max-h-[500px]">

                            {visibleNotifications.length > 0 ? (
                                <>
                                    <ul className="mt-2 space-y-2">
                                        {visibleNotifications.map((notification, index) => (
                                            <li
                                                key={notification.id}
                                                className={`text-sm text-gray-700 p-2 ${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}
                                                onClick={() => {
                                                    const ticketId = extractTicketId(notification.message);
                                                    if (ticketId) {
                                                        const fullUrl = `${window.location.origin}/ticket/${ticketId}`;
                                                        window.location.href = fullUrl;
                                                        markAsRead(notification.id);
                                                        console.log(notification.id);
                                                        console.log(notification.read);
                                                    } else {
                                                        console.warn("Invalid ticket link:", notification.message);
                                                    }
                                                }}
                                            >
                                                {notification.message}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="flex justify-center mt-4">
                                        {visibleCount < notifications.length && (
                                            <Button2
                                                variant="outline"
                                                onClick={() => setVisibleCount((prev) => prev + notifications.length)
                                                }
                                            >
                                                See more
                                            </Button2>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <p className="text-gray-500 text-sm">No new notifications</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
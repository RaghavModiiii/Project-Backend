import SockJS from "sockjs-client";
import { Client, IMessage } from "@stomp/stompjs";

let stompClient: Client | null = null;



export const connectWebSocket = (userEmail: string, onMessageReceived: (notification: any) => void): void => {
    const socket = new SockJS("http://localhost:8080/ws");
    stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000, // Reconnect every 5 seconds if disconnected
        onConnect: () => {
            console.log("🔌 Connected to WebSocket");

            // Subscribe to the user's notification queue
            stompClient?.subscribe(`/user/${userEmail}/queue/notifications`, (message: IMessage) => {
                const notification = JSON.parse(message.body);
                onMessageReceived(notification);
            });
        },
        onStompError: (frame) => {
            console.error("WebSocket Error: ", frame);
        },
    });

    stompClient.activate();
};

export const disconnectWebSocket = (): void => {
    if (stompClient) {
        stompClient.deactivate();
        stompClient = null;
    }
};
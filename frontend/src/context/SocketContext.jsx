import { createContext, useContext, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  function connect(token) {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io("http://localhost:3000", {
      auth: { token }
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socketRef.current = socket;
    return socket;
  }

  function disconnect() {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setConnected(false);
  }

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      socketRef,
      connected,
      connect,
      disconnect
    }),
    [connected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  return useContext(SocketContext);
}
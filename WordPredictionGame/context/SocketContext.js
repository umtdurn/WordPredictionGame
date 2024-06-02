import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // const newSocket = io('http://10.0.2.2:3000'); // Sunucunun URL'si
     const newSocket = io('http://172.20.10.3:3000'); // Sunucunun URL'si
    // const newSocket = io('http://192.168.1.35:3000'); // Sunucunun URL'si
  //  const newSocket = io('http://172.20.10.2:3000'); // Sunucunun URL'si
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

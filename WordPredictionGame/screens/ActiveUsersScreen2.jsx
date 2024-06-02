  
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import io from 'socket.io-client';

const ActiveUsersScreen2 = () => {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const socket = io('http://localhost:3000');
    console.log('socket çalışma alani');

    socket.on('connect', () => {
      console.log('Connected to websocket server');
    });

    socket.on('connect_error', (error) => {
      console.log('Connection failed:', error);
    });
    
    socket.on('message', (data) => {
      const users = JSON.parse(data);
      setActiveUsers(users);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <View>
      {activeUsers.map((user, index) => (
        <Text key={index}>{user.name}</Text>
      ))}
    </View>
  );
};

export default ActiveUsersScreen2;

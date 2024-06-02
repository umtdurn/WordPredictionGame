import { useEffect, useState } from 'react';
import { app } from '../config/firebaseConfig'; // Firebase configürasyonunun import edildiği varsayılıyor
import { collection, query, where, onSnapshot,getFirestore, getDatabase } from 'firebase/database';
const useActiveUsers = () => {
  const [activeUsers, setActiveUsers] = useState([]);
console.log('user getirme metodu db bağlantisi yapılacak!');
  useEffect(() => {
    const firestore = getDatabase(app);
    const q = query(collection(firestore, 'users'), where('isActive', '==', true));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data());
      });
      setActiveUsers(users);
    });

    return () => unsubscribe(); // Cleanup function
  }, []);


  useEffect(() => {
    console.log(activeUsers);
  }, [activeUsers]);

  return activeUsers;
};

export default useActiveUsers;
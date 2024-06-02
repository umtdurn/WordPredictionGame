
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React,{useState,useEffect} from 'react'
import { useSocket } from '../context/SocketContext';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from '../config/firebaseConfig'; 
const ModePage = ({navigation,route}) => {

  const socket = useSocket();
  const [gamelength, setGamelength] = useState(0);
  const [lobiler, setLobiler] = useState([]);
  const [aktifLobi, setAktifLobi] = useState(null);
  const auth = getAuth(app);
  const [currentUser, setCurrentUser] = useState(null);
  const [lobiKullanicilari, setLobiKullanicilari] = useState([]);


  const gameType = route.params?.gameType;


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // Kullanıcıyı state'e kaydet
    });
    return unsubscribe; // Cleanup
  }, []);

  useEffect(() => {
    if ( currentUser) {
      socket.emit('registerEmail', currentUser.email);
    }

  }, [currentUser]);

  useEffect(() => {
    if (socket) {
      console.log('socket aktif modeScreen');
      socket.emit('getLobiler'); // Sunucuya mevcut lobileri sor

      socket.on('lobiListesi', (gelenLobiler) => {
        
        if(gameType === 'static'){

          gelenLobiler = gelenLobiler.filter(l => l.adi.startsWith('sbt'));
        }
        else{
          gelenLobiler = gelenLobiler.filter(l =>l.adi.startsWith('dyn'));
        }
        setLobiler(gelenLobiler);
      });

      // Burası önemli: Bu event, lobide bir değişiklik olduğunda tetiklenecek
    socket.on('lobiUpdate', (guncellenmisLobi) => {
      // Eğer aktif lobi güncellenmişse, kullanıcı listesini bu güncelleme ile set et
      if (guncellenmisLobi.adi === aktifLobi) {
        setLobiKullanicilari(guncellenmisLobi.users); // Güncel kullanıcı listesi ile state'i güncelle.
      }

      // Ayrıca, lobiler listesi içindeki kullanıcı sayılarını güncelle
      setLobiler(prevLobiler => prevLobiler.map(lobi => {
        if (lobi.adi === guncellenmisLobi.adi) {
          setLobiKullanicilari(guncellenmisLobi.users);
          return { ...lobi, users: guncellenmisLobi.users };
        }
        return lobi;
      }));
    });
  
      socket.on('currentUsers', (users) => {
        if (aktifLobi) {
          setLobiKullanicilari(users); // Aktif lobi için kullanıcı listesini güncelle
        }
      });

      return () => {
        socket.off('lobiListesi');
        socket.off('lobiUpdate');
        socket.off('currentUsers');
      };
    } else {
      console.log('socket kapalı');
    }
  }, [socket, aktifLobi]);

  const katilLobiye = (lobiAdi) => {
    if (currentUser) {
      socket.emit('aktifLobiGuncelle', {lobiAdi: lobiAdi, userEmail: currentUser.email});
      socket.emit('joinLobi', { lobiName: lobiAdi, userName: currentUser.email });
      setAktifLobi(lobiAdi);
      const length = parseInt(lobiAdi[3], 10); 
      navigation.navigate("LobiScreen",{currentUser: currentUser,gameLeng: length,gameType: gameType});
    } else {
      alert("Kullanıcı bilgisi alınamadı, giriş yapmış olduğunuzdan emin olun.");
    }
  };

  return (
    <View style={styles.container}>
      {/* <Pressable style={styles.button}
      onPress={() => 
        gameType === 'static' 
          ? navigation.navigate('GamePage', {gameLeng: 4,gameType: 'static'})
          : navigation.navigate('InputForDynamic', {gameLeng: 4,gameType: 'dynamic'})
      }>
        <Text style={styles.buttonText}>4 HARFLIK</Text>
      </Pressable>
      <Pressable style={styles.button}
      onPress={() => 
        gameType ==='static'
          ? navigation.navigate('GamePage',{gameLeng: 5,gameType: 'static'})
          : navigation.navigate('InputForDynamic',{gameLeng: 5,gameType: 'dynamic'})
      
      }>
        <Text style={styles.buttonText}>5 HARFLIK</Text>
      </Pressable>
      <Pressable style={styles.button}
      onPress={() => 
        gameType === 'static'
          ? navigation.navigate('GamePage',{gameLeng: 6,gameType: 'static'})
          : navigation.navigate('InputForDynamic',{gameLeng: 6,gameType: 'dynamic'})
      
      }>
        <Text style={styles.buttonText}>6 HARFLIK</Text>
      </Pressable>
      <Pressable style={styles.button}
      onPress={() => 
        gameType === 'static'
          ? navigation.navigate('GamePage',{gameLeng: 7,gameType: 'static'})
          : navigation.navigate('InputForDynamic',{gameLeng: 7,gameType: 'dynamic'})
      }>
        <Text style={styles.buttonText}>7 HARFLIK</Text>
      </Pressable> */}

    <FlatList 
            data={lobiler}
            keyExtractor={(item) => item.adi}
            renderItem={({ item }) => (
              
              <TouchableOpacity
              style={styles.button}
              onPress={() => katilLobiye(item.adi)}
              >
                <Text style={styles.buttonText} >{`${gameType} ${item.adi[3]} (${item.users.length} kişi)`}</Text>
              </TouchableOpacity>
            )}
            />
    </View>
  )
}

export default ModePage

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        flex:1,
        marginVertical: '30%',
        marginHorizontal: '10%',
    },
    button: {
      width: '100%',
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#131313',
      borderWidth: 1,
      borderRadius: 10,
      marginVertical: 10
    },
    buttonText: {
      color: 'white'
    },
    flatContainer: {
      borderWidth: 1,
      width: '80%',
      justifyContent: 'center',
      alignItems: 'center',
    }
})
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSocket } from '../context/SocketContext';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from '../config/firebaseConfig'; 

const LobiScreen = ({ navigation ,route}) => {
  const socket = useSocket();
  const [lobiler, setLobiler] = useState([]);
  const [aktifLobi, setAktifLobi] = useState(null);
  const auth = getAuth(app);
  // const [currentUser, setCurrentUser] = useState(null);
  const [lobiKullanicilari, setLobiKullanicilari] = useState([]);
  const currentUser = route.params?.currentUser;
  const gameLeng = route.params?.gameLeng;
  const gameType = route.params?.gameType;
  const [toEmail,setToEmail] = useState("");
  const sendGameRequestByEmail = (toEmail) => {
    if (socket && currentUser) {
      setToEmail(toEmail);
      socket.emit("sendGameRequestByEmail", {
        toEmail,
        fromEmail: currentUser.email,
      });
    }
  };

  useEffect(() => {
    if (socket) {
      // Oyun isteği yanıtını dinle
      socket.on('gameRequestResponse', ({ response, toEmail }) => {
        if (response === 'accepted') {
          console.log('İstek kabul edildi, oyun başlıyor!------------------'+ toEmail);
          navigation.navigate('InputForDynamic',{gameLeng: gameLeng, toEmail: toEmail});
        } else {
          console.log('İstek reddedildi.');
        }
      });
  
      return () => {
        socket.off('gameRequestResponse');
      };
    }
  }, [socket, navigation]);
  useEffect(() => {
    if (socket) {
      console.log('socket aktif2');
      socket.emit('getLobiler'); // Sunucuya mevcut lobileri sor

      socket.on('lobiListesi2', (gelenLobiler) => {
        setLobiler(gelenLobiler);
      });

      socket.on('aktifLobi', (lobiAdi) => {
        katilLobiye(lobiAdi);
      });

      socket.on('gameRequestReceived', (data) => {
        console.log(data.fromEmail + " tarafından oyun isteği geldi.");
        navigation.navigate('GameRequestScreen', {gameLeng: gameLeng,fromEmail: data.fromEmail,currentUser: currentUser});
      });

      // Burası önemli: Bu event, lobide bir değişiklik olduğunda tetiklenecek
    socket.on('lobiUpdate2', (guncellenmisLobi) => {
      // Eğer aktif lobi güncellenmişse, kullanıcı listesini bu güncelleme ile set et
      console.log('-aktifff- '+ aktifLobi);
      if (guncellenmisLobi.adi === aktifLobi) {
          console.log(guncellenmisLobi.adi+ '-güncellendi- '+ guncellenmisLobi.users);
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
  
      // Yeni bir event listener ekliyoruz: currentUsers
      if(aktifLobi){

        socket.on('currentUsers2', (users) => {
          console.log("aktif kullanıcılar --------- "+aktifLobi);
          setLobiKullanicilari(users); // Aktif lobi için kullanıcı listesini güncelle
        });
      }

      return () => {
        socket.off('lobiListesi2');
        socket.off('lobiUpdate2');
        socket.off('currentUsers2');
        socket.off('aktifLobi');
        socket.off('gameRequestReceived');
      };
    } else {
      console.log('socket kapalı');
    }
  }, [socket, aktifLobi]);

  const katilLobiye = (lobiAdi) => {
    if (currentUser) {
      //  socket.emit('joinLobi', { lobiName: lobiAdi, userName: currentUser.email });
      setAktifLobi(lobiAdi);
    } else {
      alert("Kullanıcı bilgisi alınamadı, giriş yapmış olduğunuzdan emin olun.");
    }
  };

  const cikLobiden = (lobiAdi) => {
    if (currentUser) {
      socket.emit('leaveLobi', { lobiName: lobiAdi, userName: currentUser.email });
      setAktifLobi(null);
      setLobiKullanicilari([]); // Kullanıcı lobiden çıktığında lobi kullanıcılarını sıfırla
      // navigation.navigate("Mode",{gameType: gameType});
     navigation.push("Mode",{gameType: gameType});
    } else {
      alert("Kullanıcı bilgisi alınamadı, giriş yapmış olduğunuzdan emin olun.");
    }
  };

  const sendGameRequest = (toUserId) => {
    if (socket && currentUser) {
      socket.emit('sendGameRequest', { toUserId, fromUserId: currentUser.email });
    }
  };
  return (
    <View style={styles.container}>
      <FlatList
        data={lobiler}
        keyExtractor={(item) => item.adi}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.button}
            onPress={() => katilLobiye(item.adi)}
          >
            <Text>{`${item.adi} (${item.users.length} kişi)`}</Text>
          </TouchableOpacity>
        )}
      />
      {aktifLobi && (
        <View>
          <Text style={styles.header}>
            {aktifLobi} Lobisindeki Kullanıcılar:
          </Text>

          <FlatList
            data={lobiKullanicilari}
            extraData={lobiKullanicilari}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.userItem}>
                <Text style={styles.usrText}>{item}</Text>
                {currentUser.email !== item && (
                  <Button style={styles.sendRequest}
                    title="Oyun İsteği Gönder"
                    onPress={() => sendGameRequestByEmail(item)} 
                  />
                )}
              </View>
            )}
          />

          <Button title="Lobiden Çık" onPress={() => cikLobiden(aktifLobi)} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  button: {
    padding: 15,
    backgroundColor: '#ddd',
    marginVertical: 5,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  userItem: {
    flex:1,
    padding: 10,
    backgroundColor: '#eee',
    marginVertical: 3,
    flexDirection: 'row',
    justifyContent:'space-between',
    alignItems: 'center',
  },
  usrText: {
    fontSize: 16,
    fontWeight: 'bold',

  },
  sendRequest: {
    padding: 10,
    backgroundColor: '#ddd',
    marginVertical: 3,
  },
});

export default LobiScreen;

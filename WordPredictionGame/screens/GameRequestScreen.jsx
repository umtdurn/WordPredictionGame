import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useSocket } from '../context/SocketContext';

const GameRequestScreen = ({ route, navigation }) => {
  const { fromEmail } = route.params;
  const socket = useSocket();
  const [requestFrom, setRequestFrom] = useState('');
  const [timer, setTimer] = useState(10)
  const [checkRequest, setCheckRequest] = useState(false);
  const currentUser = route.params?.currentUser;

const gameLeng = route.params?.gameLeng;

useEffect(() => {

  if (fromEmail) {
    setRequestFrom(fromEmail);
  }

  const interval = setInterval(() => {

    setTimer(() => {
        console.log(timer);
        if(!checkRequest){
          if(timer <= 0){
            clearInterval(interval);
            declineGameRequest();
          }
        }
        else{
          clearInterval(interval);
          return timer;
        }
        return timer - 1
      });

  }, 1000); // Her saniye bu bloğu çalıştır
return () => clearInterval(interval);
}, [timer]);

  const acceptGameRequest = () => {
    setCheckRequest(true);
    socket.emit('respondToGameRequest', { response: 'accepted', fromEmail: requestFrom , toEmail: currentUser.email}); // isteği gönderene haber ver
    console.log('game has sent by: ' + requestFrom);
    navigation.navigate('InputForDynamic',{gameLeng: gameLeng, toEmail: requestFrom});
  };

  const declineGameRequest = () => {
    socket.emit('respondToGameRequest', { response: 'declined', fromEmail: requestFrom });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text>{requestFrom} tarafından oyun isteği alındı.</Text>
      <Text>Kalan süre: {timer} saniye</Text>
      <View style={styles.butonContainer}>
      <Button title="Kabul Et" onPress={acceptGameRequest} />
      <Button title="Reddet" onPress={declineGameRequest} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  butonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    margin: 20,

  }
});

export default GameRequestScreen;

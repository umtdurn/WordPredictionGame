import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';
// import auth from '@react-native-firebase/auth';
// import auth from 'firebase/auth';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {app} from '../config/firebaseConfig';
import { getDatabase} from "firebase/database";



const GameScreen = ({navigation}) => {
  
    const auth = getAuth(app);
    const db = getDatabase(app);
     onAuthStateChanged(auth,(user) => {
      if (!user) {
        console.log('Giriş bbaşarısız');
        navigation.navigate('Welcome');
      }
    });
  

  return (
    <View style={styles.container}>
      <Text> Oyun Sayfası</Text>
      <Button onPress={() => navigation.navigate('ActiveUsers2')}
      >Aktif Kullanıcılar</Button>
      <Button onPress={() => navigation.navigate("LobiScreen")}>Lobies</Button>
      <Button onPress={() => navigation.navigate("Settings")}>Settings</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  buttonContainer: {
    alignSelf: 'center',
  },
});

export default GameScreen;

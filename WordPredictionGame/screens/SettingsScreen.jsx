//import {firebase} from '@react-native-firebase/auth';
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import React, { useState,useEffect } from "react";
import { Text, View, StyleSheet } from "react-native";
import { Avatar, Title, Button, Subheading } from "react-native-paper";
import { app } from "../config/firebaseConfig";
import { getDatabase, ref, update, serverTimestamp } from 'firebase/database';


const SettingsScreen = ({ navigation }) => {
    const  auth = getAuth(app);
  const handleSignOut = () => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const db = getDatabase(app);
        console.log(user.email);
       await signOut(auth).then(async () => {
          // Kullanıcı çıkış yaptı, durumunu güncelle
          console.log("çıkış yapıldı");
          await update(ref(db, 'users/' + user.uid), {
            isActive: false,
            lastActiveTime: serverTimestamp()
          });
          navigation.navigate('Game');
        }).catch((error) => {
          // Bir hata oluştu
        });
      }
    });
  };

  return (
    <View style={styles.container}>
      <Avatar.Text label="UN" />
      <Title>User Name</Title>
      <Subheading>user@name.gmail.com</Subheading>
      <Button onPress={handleSignOut}>Sign Out</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default SettingsScreen;

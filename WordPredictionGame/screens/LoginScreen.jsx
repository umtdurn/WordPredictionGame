import React, {useState} from 'react';
import {View, TextInput, StyleSheet, Alert} from 'react-native';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {app} from '../config/firebaseConfig';
import { getDatabase, ref, update, serverTimestamp } from 'firebase/database';
// import auth from '@react-native-firebase/auth';
import {Button, Subheading} from 'react-native-paper';
const LoginScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const auth = getAuth(app);
  const handleSignIn = () => {
    // auth()
    // .signInWithEmailAndPassword(email, password)
    const db = getDatabase(app);
     signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        // Alert.alert('Başarılı', 'Giriş yapıldı!');
        await update(ref(db, 'users/' + userCredential.user.uid), {
          isActive: true,
          lastActiveTime: serverTimestamp()
        });
        navigation.navigate("Type");
      })
      .catch(error => {
        Alert.alert('Hata', error.message);
      });
  };

  return (
    <View style={styles.container}>
      {!!error && (
        <Subheading
          style={{color: 'red', textAlign: 'center', marginBottom: 16}}>
          {error}
        </Subheading>
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttoncontainer}>
        <Button
          mode="contained"
          buttonColor="black"
          title="Kayıt Ol"
          onPress={() => navigation.navigate('Register')}>
          Kayıt Ol
        </Button>
        <Button
          compact={true}
          mode="elevated"
          textColor="black"
          title="Giriş Yap"
          onPress={handleSignIn}>
          Giriş Yap
        </Button>
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
  buttoncontainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 10,
    borderRadius: 6,
  },
});

export default LoginScreen;

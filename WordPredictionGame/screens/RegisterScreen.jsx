import React, {useState} from 'react';
import {View, TextInput, StyleSheet, Alert, Subheading} from 'react-native';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import {app} from '../config/firebaseConfig';
import { getDatabase, ref, set, serverTimestamp } from 'firebase/database';

// import auth from '@react-native-firebase/auth';
import {Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = getAuth(app);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    setIsLoading(true);
    // auth()
    //   .createUserWithEmailAndPassword(email, password)
    await createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      // Kullanıcı kaydı başarılı
      const user = userCredential.user;
      
      // Kullanıcı bilgilerini Realtime Database'e kaydet
      const db = getDatabase(app);
      await set(ref(db, 'users/' + userCredential.user.uid), {
        email: email,
        isActive: true,
        lastActiveTime: serverTimestamp() // Sunucunun zaman damgasını kullan
      });
      
      Alert.alert('Başarılı', 'Kayıt başarılı, giriş yapabilirsiniz!');
      navigation.navigate('Type');
    })
    .catch((error) => {
      // Kayıt sırasında hata oluştu
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
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        mode="contained"
        buttonColor="black"
        title="Kayıt Ol"
        onPress={handleSignUp}
        loading={isLoading}>
        Kayıt Ol
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 6,
  },
});

export default RegisterScreen;

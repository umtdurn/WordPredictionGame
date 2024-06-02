import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from 'react-native-paper';

const WelcomeScreen = ({navigation}) => {
  

  return (
    <View style={styles.container}>
      <Button
        style={{margin: 20}}
        title="Giriş Yap"
        onPress={() => navigation.navigate('Login')}
        // onPress={() => navigation.navigate("InputForDynamic", {gameLeng: 4})}
        mode="elevated"
        textColor="gray">
        Giriş Yap
      </Button>
      <Button
        style={{margin: 20}}
        title="Kayıt Ol"
        onPress={() => navigation.navigate('Register')}
        mode="contained"
        buttonColor="gray">
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
  buttonContainer: {
    alignSelf: 'center',
  },
});

export default WelcomeScreen;

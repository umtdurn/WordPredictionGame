import React, { useEffect } from 'react'
import { 
  StyleSheet, 
  Text, 
  View,
  Pressable, 
  Alert
} from 'react-native'

const TypePage = ({navigation, route}) => {
  let inputPageMessage = route.params?.message;
  let inputPageAlert = route.params?.check;

  useEffect(() => {
    if(inputPageAlert){
      Alert.alert('Uyarı',inputPageMessage);
    }

    return () => {
      null
    }

  }, [inputPageAlert])



  return (

    <View style={styles.container}>

      <Pressable style={styles.button}
      onPress={() => navigation.navigate('Mode', {gameType: "static"})}>
        <Text 
        style={styles.textElement}>
          Sabit Kelimeli</Text>
      </Pressable>

      <Pressable style={styles.button}
      onPress={() => navigation.navigate('Mode', {gameType: "dynamic"})}>
        <Text
        style={styles.textElement}>
          Dinamik</Text>
      </Pressable>


    </View>
  )
}

export default TypePage

const styles = StyleSheet.create({
  container:{
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },  
  button: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    marginVertical: 20,
    borderRadius: 10,
    backgroundColor: '#131313',
    alignItems: 'center',
    justifyContent: 'center'
  },
  textElement: {
    color: 'white',
  }
})
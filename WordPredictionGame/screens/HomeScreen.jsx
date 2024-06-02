 import React, {useState, useEffect} from 'react';
 import {View,Text, StyleSheet} from 'react-native';
 import {Button} from 'react-native-paper';
 const HomeScreen = ({navigation}) => {

   return (
     <View style={styles.container}>
       <Text>oyuna kabul başırılı oyuna hoş geldiniz beyler :o</Text>
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
 export default HomeScreen;

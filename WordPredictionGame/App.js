import React, {useEffect} from 'react';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import GameScreen from './screens/GameScreen';
import ResultPage from './screens/ResultPage';
import ActiveUsersScreen from './screens/ActiveUsersScreen';
import ActiveUsersScreen2 from './screens/ActiveUsersScreen2';
import GameRequestScreen from './screens/GameRequestScreen';
import GamePage from './screens/GamePage';
import ModeScreen from './screens/ModeScreen';
import ResultScreen from './screens/ResultScreen';
import TypeScreen from './screens/TypeScreen';
import InputForDynamicPage from './screens/InputForDynamicPage';
import LobiScreen from './screens/LobiScreen';
import RivalScreen from './screens/RivalScreen'
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import firebase from '@react-native-firebase/app';
// import '@react-native-firebase/auth';
// import '@react-native-firebase/firestore';
// import {firebase} from '@react-native-firebase/auth';
import { AppState } from 'react-native';
import { getDatabase} from "firebase/database";
import { SocketProvider } from './context/SocketContext';
// import firebase from 'firebase/app';
// import 'firebase/auth';
import 'firebase/firestore';
// import { initializeApp } from "firebase/app";
import { getAuth ,onAuthStateChanged} from "firebase/auth";

import {app} from './config/firebaseConfig';
// import ResultPage from './screens/ResultPage';

 const Stack = createNativeStackNavigator();
 const Tabs = createBottomTabNavigator();
 
  // firebase.initializeApp(firebaseConfig);

  
  
  // const app = initializeApp(firebaseConfig);
  // Initialize Firebase Authentication and get a reference to the service
  
  
//  const TabsNavigator = () => {
//    const navigation = useNavigation();

//   useEffect(() => {
//     onAuthStateChanged(auth,(user) => {
//       console.log(user);
//       if (!user) {
//         navigation.navigate('Home');
//       }
//       if (user) {
//         navigation.navigate('Game');
//       }
//     });
//   }, []);

 
//   return (
//     <Tabs.Navigator>
//       <Tabs.Screen name="Home" component={HomeScreen} />
//       <Tabs.Screen name="Settings" component={SettingsScreen} />
//     </Tabs.Navigator>
//   );
// };

const App = () => {
  
  // const auth = getAuth(app);

  
  // useEffect(() => {
  //   const db = getDatabase(app);
  //   const handleAppStateChange = nextAppState => {
  //     if (nextAppState === 'inactive' || nextAppState === 'background') {
  //       // Kullanıcı uygulamayı arka plana aldı veya kapattı
  //       const user = auth.currentUser;
  //       if (user) {
  //         db().ref('users/' + user.uid).update({
  //           online: false
  //         });
  //       }
  //     }
  //   };
  
  //   return () => {
  //     AppState.removeEventListener('change', handleAppStateChange);
  //     unsubscribe();
  //   };
  // }, []);

  return (
    <SocketProvider>
      <NavigationContainer>
        <Stack.Navigator
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="GamePage" component={GamePage} />
          <Stack.Screen name='Rival' component={RivalScreen}/>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="LobiScreen" component={LobiScreen} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="GameRequestScreen" component={GameRequestScreen} />
          <Stack.Screen name="Mode" component={ModeScreen} />
          <Stack.Screen name="InputForDynamic" component={InputForDynamicPage} />
          <Stack.Screen name="Type" component={TypeScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
          <Stack.Screen
            name="ActiveUsers2"
            ActiveUsersScreen
            component={ActiveUsersScreen2}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketProvider>

    // <NavigationContainer>
    //   <Stack.Navigator>
    //     <Stack.Screen
    //       name="Main"
    //       component={TabsNavigator}
    //       options={{headerShown: false}}
    //     />
    //     <Stack.Screen
    //       name="Login"
    //       component={LoginScreen}
    //       options={{presentation: 'fullScreenModal'}}
    //     />
    //      <Stack.Screen
    //       name="Home"
    //       component={HomeScreen}
    //       options={{presentation: 'fullScreenModal'}}
    //     />
    //     <Stack.Screen
    //       name="Register"
    //       component={RegisterScreen}
    //       options={{presentation: 'fullScreenModal'}}
    //     />
    //     <Stack.Screen
    //       name="Game"
    //       component={GameScreen}
    //       // options={{presentation: 'fullScreenModal'}}
    //     />

    //     <Stack.Screen
    //       name="ActiveUsers"ActiveUsersScreen
    //       component={ActiveUsersScreen}
    //     />
    //      <Stack.Screen
    //       name="ActiveUsers2"ActiveUsersScreen
    //       component={ActiveUsersScreen2}
    //     />
    //   </Stack.Navigator>
    // </NavigationContainer>
  );
};

export default App;

/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';

import {
  DefaultTheme,
  Provider as PaperProvider,
  Title,
} from 'react-native-paper';

import firebase from '@react-native-firebase/app';
import {createStackNavigator} from '@react-navigation/stack';
import NavigationContainer from '@react-navigation/native/src/NavigationContainer';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';

const firebaseConfig = {
  apiKey: 'AIzaSyDPHcaVV6I0RnWqFnbv2BrfZi6dgb0LX5I',
  authDomain: 'eatmatic-143319.firebaseapp.com',
  // databaseURL: 'https://eatmatic-143319-8b6f2.firebaseio.com',
  databaseURL: 'https://eatmatic-143319.firebaseio.com',
  projectId: 'eatmatic-143319',
  storageBucket: 'eatmatic-143319.appspot.com',
  messagingSenderId: '1088252386731',
  appId: '1:1088252386731:web:3174573f37cab667a986ee',
  measurementId: 'G-DLKYKBH02H',
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#5e8d93',
    accent: '#eb9f12',
  },
};

const App = () => {
  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="dark-content">
        <Title style={styles.appbarTitle}>SCUVER DRIVER</Title>
      </StatusBar>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={'Home'}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  appbarTitle: {
    color: '#ffffff',
    textAlign: 'center',
    marginLeft: '32%',
  },
  scrollView: {
    textAlign: 'center',
    padding: '2%',
  },
});

export default App;

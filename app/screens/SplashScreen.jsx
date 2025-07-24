import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar'; // ✅ use this!

const SplashScreen = () => {
  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.StatusBar}/>
        <StatusBar barStyle='dark-content'/>
        <Image
          source={require('../../assets/Images/whitelogo.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </SafeAreaView>
   
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#004d00', // Full green screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  StatusBar:{
    backgroundColor: '#004d00', // your desired background color
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 680,
    height: 680,
  },
});

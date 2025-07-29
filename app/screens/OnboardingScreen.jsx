import React from 'react';
import { View, Image, Text, StyleSheet, ImageBackground, Dimensions, TouchableOpacity } from 'react-native';
import Swiper from 'react-native-swiper';
import { useColorScheme} from "react-native";

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onDone }) => {
  return (
    <ImageBackground
      source={require('../../assets/Images/background.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Swiper 
        loop={false} 
        showsButtons={false} 
        dotColor="white" 
        activeDotColor="green"
        paginationStyle={styles.paginationStyle}
        dotStyle={styles.dotStyle}
        activeDotStyle={styles.activeDotStyle}
      >
        <View style={styles.slide}>
          <Image style={styles.logo} source={require('../../assets/Images/plogo.png')} />
          <View style={styles.slideContainer}>
            <Image style={styles.camImage} source={require('../../assets/Images/cam1.png')} />
            <Text style={styles.text}>Take a photo of your diseased plant and upload it</Text>
          </View>
        </View>
        
        <View style={styles.slide}>
          <Image style={styles.logo} source={require('../../assets/Images/plogo.png')} />
          <View style={styles.slideContainer}>
            <Image style={styles.analyseImage} source={require('../../assets/Images/analyse.png')} resizeMode='contain'/>
            <Text style={styles.text}>Get real-time diagnosis from our AI model</Text>
          </View>
        </View>
        
        <View style={styles.slide}>
          <Image style={styles.logo} source={require('../../assets/Images/plogo.png')} />
          <View style={styles.slideContainer}>
            <Image style={styles.diagnosisImage} source={require('../../assets/Images/diagnosis.png')} resizeMode='contain' />
            <Text style={styles.text}>Receive treatment suggestions instantly</Text>
          </View>
          
          <TouchableOpacity style={styles.button} onPress={onDone}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </Swiper>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80, // Add padding to make room for dots
  },
  slideContainer:{
    backgroundColor:'rgba(0,0,0,0.1)',
    borderRadius: 20,
    marginTop: 20,
    marginHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
  },
  text: {
    fontSize: 20,
    color: 'black',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    marginTop: 60,
    backgroundColor: 'green',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  camImage:{
    height: 350,
    width: 350,
  },
  analyseImage:{
    height: 350,
    marginBottom: 20,
    width: 250,
  },
  diagnosisImage:{
    height: 350,
    width: 250,
  },
  // Pagination dot styles
  paginationStyle: {
    bottom: 30, // Position dots 30px from bottom
  },
  dotStyle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 3,
    marginRight: 3,
  },
  activeDotStyle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 3,
    marginRight: 3,
  }
});

export default OnboardingScreen;
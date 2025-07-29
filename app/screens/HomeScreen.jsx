import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { ThemeContext } from '../ThemeContext';
import {useNavigation} from '@react-navigation/native';
import { Camera } from 'expo-camera';

const HomeScreen = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar backgroundColor={theme.primary} barStyle={theme.statusBarStyle} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.headerLogo}>
          <Image style={styles.logo} source={require('../../assets/Images/leaflensLogo.png')} />
          <Image style={styles.plogo} source={require('../../assets/Images/plogo.png')} />
        </View>
        <Text style={[styles.greeting, { color: theme.text }]}>Welcome, Johnson</Text>
      </View>

      {/* Weather */}
      <View style={[styles.weatherBox, {backgroundColor: theme.weatherBoxBackground}]}>
        <View>
          <Text style={[styles.weatherText, { color: theme.text }]}>Today, 13 Mar</Text>
          <Text style={[styles.weatherSubText, { color: theme.subtext }]}>Clear · 24°C / 20°C</Text>
        </View>
        <Image source={require('../../assets/Images/sun.png')} style={styles.weatherIcon} />
      </View>

      {/* Help your crop */}
      <View style={[styles.helpBox, { backgroundColor: theme.card }]}>
        <Text style={[styles.helpTitle, { color: theme.text }]}>Help your crop</Text>
        <View style={styles.steps}>
          <View style={styles.stepcontainer}>
            <Image 
              style={styles.capture}
              source={
                theme.mode === 'dark' 
                ? require('../../assets/Images/capture-white.png')
                : require('../../assets/Images/capture.png')
                } />
            <Text style={[styles.stepText, { color: theme.text }]}>Take the picture</Text>
          </View>

          <Image 
              style={styles.forward}
              source={
                theme.mode === 'dark' 
                ? require('../../assets/Images/forward-white.png')
                : require('../../assets/Images/forward.png')
                } />

          <View style={styles.stepcontainer}>
          <Image 
              style={styles.analyse}
              source={
                theme.mode === 'dark' 
                ? require('../../assets/Images/scan-white.png')
                : require('../../assets/Images/scan.png')
                } />
            <Text style={[styles.stepText, { color: theme.text }]}>Analyse Disease</Text>
          </View>

          <Image 
              style={styles.forward}
              source={
                theme.mode === 'dark' 
                ? require('../../assets/Images/forward-white.png')
                : require('../../assets/Images/forward.png')
                } />

          <View style={styles.stepcontainer}>
          <Image 
              style={styles.diagnose}
              source={
                theme.mode === 'dark' 
                ? require('../../assets/Images/diagnosisIcon-white.png')
                : require('../../assets/Images/diagnosisIcon.png')
                } />
            <Text style={[styles.stepText, { color: theme.text }]}>Check the Report</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.takePictureButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Camera')}
>
          <Text style={styles.takePictureText}>Take picture</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Diagnosis */}
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent diagnosis</Text>
      {[1, 2, 3, 4].map((item, index) => (
        <View key={index} style={[styles.diagnosisCard, { backgroundColor: theme.card }]}>
          <Image source={require('../../assets/Images/riceImage.png')} style={styles.diagnosisImage} />
          <View style={styles.diagnosisText}>
            <Text style={[styles.cropTitle, { color: theme.text }]}>Rice Crop</Text>
            <Text style={[styles.disease, { color: theme.subtext }]}>Disease: Bacterial blight</Text>
            <Text style={[styles.more, { color: theme.primary }]}>Know more...</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default HomeScreen;



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fdf9',
    padding: 16,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#e6f9ef',
    margin: -16,
    paddingHorizontal: 16,

  },

  headerLogo:{
    display: 'flex',
    flexDirection: 'row',
  },
  logo:{
    width: 95,
    height: 95,
    marginTop: -10,
  },
  plogo:{
    width: 70,
    height: 70,
    marginLeft: 200,
    marginTop: 5,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: -10,
    marginBottom: 20,
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  cropRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  cropItem: {
    alignItems: 'center',
  },
  cropImage: {
    width: 50,
    height: 50,
  },
  cropName: {
    marginTop: 4,
  },
  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'space-between',
    marginVertical: 10,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  
    // Shadow (Android)
    elevation: 4,
  },
  weatherText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weatherSubText: {
    fontSize: 12,
    color: '#666',
  },
  weatherIcon: {
    width: 30,
    height: 30,
  },
  helpBox: {
    backgroundColor: '#e6f9ef',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,

    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  
    // Shadow (Android)
    elevation: 4,
  },
  helpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  }
  ,
  steps: {
    display:'flex',
    flexDirection:'row',
  
  }
  ,

  stepcontainer: {
    marginLeft: 5,
  },


  stepText: {
    width: '80%',
    textAlign:'center',
    marginLeft: 5,
  }
  ,

  capture:{
    width: 60,
    height: 60,
    marginLeft: 20,
    
  
  },
  forward: {
    width: 20,
    height: 20,
    marginTop: 20
  }
  ,
  analyse:{
    width: 60,
    height: 60,
    marginLeft: 20,
   
   
  },
  diagnose:{
    width: 40,
    height: 40,
    marginLeft: 20,
    marginBottom: 10
   
  
  },
  takePictureButton: {
    backgroundColor: '#24A148',
    paddingVertical: 12,
    borderRadius: 15,
    marginTop: 20,
    alignItems: 'center',
    width: 200,
    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  
    // Shadow (Android)
    elevation: 4,
  },
  takePictureText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
  ,
  takePictureText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center'
  },
  linkBox: {
    marginVertical: 10,
  },
  linkItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfLink: {
    backgroundColor: '#fff',
    flex: 0.48,
    padding: 16,
    borderRadius: 8,
  },
  diagnosisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
  
    // Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  
    // Shadow (Android)
    elevation: 4,
  },
  diagnosisImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  diagnosisText: {
    flex: 1,
  },
  cropTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  disease: {
    color: '#444',
  },
  more: {
    color: 'green',
    fontSize: 12,
    marginTop: 4,
  },
  
});

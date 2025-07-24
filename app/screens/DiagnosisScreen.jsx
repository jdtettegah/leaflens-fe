import React, {useContext} from 'react';
import { View, Text, Image, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useColorScheme} from "react-native";
import {useRouter} from 'expo-router';
import {useNavigation} from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext';

const Diagnosis = () => {
  const {theme} = useContext(ThemeContext);
  const navigation = useNavigation();
  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar backgroundColor='white' barStyle={'dark-content'}/>

      <View style={[styles.header, {backgroundColor: theme.background}]}>
        <View style={styles.headerLogo}>
          <Image style={styles.logo} source={require('../../assets/Images/leaflensLogo.png')}/>
          <Image style={styles.plogo} source={require('../../assets/Images/plogo.png')}/>
        </View>
      </View>

      <View style={[styles.weatherBox, {backgroundColor: theme.weatherBoxBackground}]}>
        <Text style={[styles.weatherText, {color: theme.text}]}>Recent Diagnosis</Text>
        <Image source={require('../../assets/Images/diagnosisIcon.png')} style={styles.weatherIcon} />
      </View>

      {[1, 2, 3, 4,5,6,7,8,9,10].map((item, index) => (
       <TouchableOpacity
        key={index} 
        style={[styles.diagnosisCard, {backgroundColor: theme.card}]} 
        onPress={() => navigation.navigate('Report')}
       >
          
          <Image source={require('../../assets/Images/riceImage.png')} style={styles.diagnosisImage} />
          <View style={styles.diagnosisText}>
            <Text style={[styles.cropTitle, { color: theme.text }]}>Rice Crop</Text>
            <Text style={[styles.disease, { color: theme.subtext }]}>Disease: Bacterial blight</Text>
            <Text style={[styles.more, { color: theme.primary }]}>Know more...</Text>
          </View>
      </TouchableOpacity> 
       

        
      ))}
    </ScrollView>
  );
};

export default Diagnosis;

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

  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
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
    fontSize: 18,
    fontWeight: '600',
  },
  weatherSubText: {
    fontSize: 12,
    color: '#666',
  },
  weatherIcon: {
    width: 28,
    height: 34,
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

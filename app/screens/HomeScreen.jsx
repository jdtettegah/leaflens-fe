import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { ThemeContext } from '../ThemeContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService, getBaseURLForImages } from '../../services/api';

const HomeScreen = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const [firstName, setFirstName] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setFirstName(user.first_name || '');
        }
      } catch (error) {
        console.error('Error loading user from AsyncStorage:', error);
      }
    };
    fetchUser();
    fetchPredictions();
  }, []);

  // Refresh predictions whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchPredictions();
    }, [])
  );

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAllPredictions();
      
      if (response.data.success) {
        setPredictions(response.data.predictions);
      } else {
        setError('Failed to fetch predictions');
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setError('Failed to load diagnosis history');
    } finally {
      setLoading(false);
    }
  };

  const parsePrediction = (predictionString) => {
    const parts = predictionString.split(' - ');
    if (parts.length >= 2) {
      return {
        crop: parts[0].trim(),
        disease: parts.slice(1).join(' - ').trim()
      };
    }
    return {
      crop: 'Unknown Crop',
      disease: predictionString
    };
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return require('../../assets/Images/riceImage.png');
    if (imagePath.startsWith('http')) return { uri: imagePath };
    const baseURL = getBaseURLForImages();
    return { uri: `${baseURL}${imagePath}` };
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar backgroundColor={theme.primary} barStyle={theme.statusBarStyle} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <View style={styles.headerLogo}>
          <Image style={styles.logo} source={require('../../assets/Images/leaflensLogo.png')} />
          <Image style={styles.plogo} source={require('../../assets/Images/plogo.png')} />
        </View>
        <Text style={[styles.greeting, { color: theme.text }]}>
          Hello{firstName ? `, ${firstName}` : ', there'}!
        </Text>
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
              }
            />
            <Text style={[styles.stepText, { color: theme.text }]} numberOfLines={2}>Take the picture</Text>
          </View>

          <View style={styles.arrowContainer}>
            <Image
              style={styles.forward}
              source={
                theme.mode === 'dark'
                  ? require('../../assets/Images/forward-white.png')
                  : require('../../assets/Images/forward.png')
              }
            />
          </View>

          <View style={styles.stepcontainer}>
            <Image
              style={styles.analyse}
              source={
                theme.mode === 'dark'
                  ? require('../../assets/Images/scan-white.png')
                  : require('../../assets/Images/scan.png')
              }
            />
            <Text style={[styles.stepText, { color: theme.text }]} numberOfLines={2}>Analyse Disease</Text>
          </View>

          <View style={styles.arrowContainer}>
            <Image
              style={styles.forward}
              source={
                theme.mode === 'dark'
                  ? require('../../assets/Images/forward-white.png')
                  : require('../../assets/Images/forward.png')
              }
            />
          </View>

          <View style={styles.stepcontainer}>
            <Image
              style={styles.diagnose}
              source={
                theme.mode === 'dark'
                  ? require('../../assets/Images/diagnosisIcon-white.png')
                  : require('../../assets/Images/diagnosisIcon.png')
              }
            />
            <Text style={[styles.stepText, { color: theme.text }]} numberOfLines={2}>Check the Report</Text>
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
       
       {loading ? (
         <View style={styles.loadingContainer}>
           <ActivityIndicator size="large" color={theme.primary} />
           <Text style={[styles.loadingText, { color: theme.text }]}>Loading diagnosis history...</Text>
         </View>
       ) : error ? (
         <View style={styles.errorContainer}>
           <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
           <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchPredictions}>
             <Text style={styles.retryText}>Retry</Text>
           </TouchableOpacity>
         </View>
       ) : predictions.length === 0 ? (
         <View style={styles.emptyContainer}>
           <Text style={[styles.emptyText, { color: theme.text }]}>No diagnosis history yet</Text>
           <Text style={[styles.emptySubText, { color: theme.subtext }]}>Take your first picture to get started!</Text>
         </View>
       ) : (
         <>
           {/* Show all predictions if 4 or fewer, otherwise show only the 4 most recent */}
           {predictions.slice(0, predictions.length <= 4 ? predictions.length : 4).map((prediction, index) => {
             const { crop, disease } = parsePrediction(prediction.prediction);
             return (
               <TouchableOpacity
                 key={prediction.id}
                 style={[styles.diagnosisCard, { backgroundColor: theme.card }]}
                 onPress={() => navigation.navigate('Report', { 
                   predictionId: prediction.id,
                   diagnosisData: {
                     cropName: crop,
                     disease: disease,
                     imageUri: getImageUrl(prediction.image),
                     confidence: prediction.confidence || 0.95,
                     timestamp: prediction.timestamp
                   }
                 })}
               >
                 <Image source={getImageUrl(prediction.image)} style={styles.diagnosisImage} />
                 <View style={styles.diagnosisText}>
                   <Text style={[styles.cropTitle, { color: theme.text }]}>{crop}</Text>
                   <Text style={[styles.disease, { color: theme.subtext }]}>Disease: {disease}</Text>
                   <Text style={[styles.date, { color: theme.subtext }]}>{formatDate(prediction.timestamp)}</Text>
                   <Text style={[styles.more, { color: theme.primary }]}>Know more...</Text>
                 </View>
               </TouchableOpacity>
             );
           })}
           
           {/* Show "See All Predictions" button if there are more than 4 predictions */}
           {predictions.length > 4 && (
             <TouchableOpacity
               style={[styles.seeAllButton, { backgroundColor: theme.card }]}
               onPress={() => navigation.navigate('Diagnosis')}
             >
               <Text style={[styles.seeAllText, { color: theme.primary }]}>See All Predictions</Text>
             </TouchableOpacity>
           )}
         </>
       )}
    </ScrollView>
  );
};

export default HomeScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fdf9',
    padding: 20,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#e6f9ef',
    margin: -20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },

  headerLogo:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo:{
    width: 85,
    height: 85,
  },
  plogo:{
    width: 60,
    height: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  notificationIcon: {
    width: 24,
    height: 24,
  },
  sectionTitle: {
    marginTop: 30,
    marginBottom: 15,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
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

  helpBox: {
    backgroundColor: '#ffffff',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  helpTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2c3e50',
    letterSpacing: 0.3,
  },
  steps: {
    display:'flex',
    flexDirection:'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  stepcontainer: {
    alignItems: 'center',
    flex: 0.3,
    minHeight: 70,
    justifyContent: 'center',
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.05,
    marginTop: -15,
  },
  stepText: {
    textAlign:'center',
    marginTop: 6,
    fontSize: 9,
    fontWeight: '600',
    color: '#555',
    lineHeight: 11,
    width: '100%',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  capture:{
    width: 45,
    height: 45,
    marginBottom: 4,
  },
  forward: {
    width: 16,
    height: 16,
  },
  analyse:{
    width: 45,
    height: 45,
    marginBottom: 4,
  },
  diagnose:{
    width: 35,
    height: 35,
    marginBottom: 4,
  },
  takePictureButton: {
    backgroundColor: '#24A148',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginTop: 25,
    alignItems: 'center',
    minWidth: 220,
    shadowColor: '#24A148',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  takePictureText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.5,
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
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  diagnosisImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
  },
  diagnosisText: {
    flex: 1,
  },
  cropTitle: {
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 6,
    color: '#2c3e50',
    letterSpacing: 0.3,
  },
  disease: {
    color: '#7f8c8d',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  more: {
    color: '#24A148',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 18,
  },
     emptySubText: {
     textAlign: 'center',
     fontSize: 14,
   },
   seeAllButton: {
     alignItems: 'center',
     justifyContent: 'center',
     paddingVertical: 16,
     paddingHorizontal: 24,
     borderRadius: 16,
     marginTop: 12,
     marginBottom: 8,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.08,
     shadowRadius: 8,
     elevation: 6,
     borderWidth: 1,
     borderColor: 'rgba(0,0,0,0.03)',
   },
   seeAllText: {
     fontSize: 16,
     fontWeight: '700',
     letterSpacing: 0.3,
   },
 });

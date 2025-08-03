import React, {useContext, useState, useEffect} from 'react';
import { View, Text, Image, StyleSheet, ScrollView, StatusBar, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useColorScheme} from "react-native";
import {useRouter} from 'expo-router';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext';
import { apiService, getBaseURLForImages } from '../../services/api';

const Diagnosis = () => {
  const {theme} = useContext(ThemeContext);
  const navigation = useNavigation();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load data when component mounts
  useEffect(() => {
    fetchPredictions();
  }, []);

  // Refresh data when screen comes into focus
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
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to load diagnosis history');
      Alert.alert('Error', 'Failed to load diagnosis history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const parsePrediction = (predictionString) => {
    // Parse "Crop - Disease" format
    const parts = predictionString.split(' - ');
    if (parts.length === 2) {
      return {
        crop: parts[0].trim(),
        disease: parts[1].trim()
      };
    }
    return {
      crop: 'Unknown Crop',
      disease: predictionString
    };
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it's a relative path, combine with base URL from api.js
    const baseURL = getBaseURLForImages();
    return `${baseURL}${imagePath}`;
  };

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.background}]} showsVerticalScrollIndicator={false}>
      <StatusBar backgroundColor={theme.background} barStyle={'dark-content'}/>

      <View style={[styles.header, {backgroundColor: theme.background}]}>
        <View style={styles.headerLogo}>
          <Image style={styles.logo} source={require('../../assets/Images/leaflensLogo.png')}/>
          <Image style={styles.plogo} source={require('../../assets/Images/plogo.png')}/>
        </View>
      </View>

      <View style={[styles.weatherBox, {backgroundColor: theme.card}]}>
        <Text style={[styles.weatherText, {color: theme.text}]}>Recent Diagnosis</Text>
        <Image source={require('../../assets/Images/diagnosisIcon.png')} style={styles.weatherIcon} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, {color: theme.text}]}>Loading diagnosis history...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, {color: theme.text}]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, {backgroundColor: theme.primary}]} onPress={fetchPredictions}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : predictions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: theme.text}]}>No diagnosis history found</Text>
          <Text style={[styles.emptySubText, {color: theme.subtext}]}>Start by taking a photo of a plant to get your first diagnosis</Text>
        </View>
      ) : (
        predictions.map((prediction, index) => {
          const { crop, disease } = parsePrediction(prediction.prediction);
          const imageUrl = getImageUrl(prediction.image);
          
          return (
            <TouchableOpacity
              key={prediction.id || index} 
              style={[styles.diagnosisCard, {backgroundColor: theme.card}]} 
              onPress={() => navigation.navigate('Report', {
                diagnosis: {
                  cropName: crop,
                  disease: disease,
                  confidence: 0.95, // Default confidence since not provided in API
                  imageUri: imageUrl,
                  predictionId: prediction.id,
                  timestamp: prediction.timestamp
                }
              })}
            >
              <Image 
                source={imageUrl ? {uri: imageUrl} : require('../../assets/Images/riceImage.png')} 
                style={styles.diagnosisImage} 
              />
              <View style={styles.diagnosisText}>
                <Text style={[styles.cropTitle, { color: theme.text }]}>
                  {crop}
                </Text>
                <Text style={[styles.disease, { color: theme.subtext }]}>
                  Disease: {disease}
                </Text>
                <Text style={[styles.timestamp, { color: theme.subtext }]}>
                  {formatDate(prediction.timestamp)}
                </Text>
                <Text style={[styles.more, { color: theme.primary }]}>Know more...</Text>
              </View>
            </TouchableOpacity> 
          );
        })
      )}
    </ScrollView>
  );
};

export default Diagnosis;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fdf9',
    padding: 20,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    margin: -20,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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

  weatherBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  weatherText: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  weatherSubText: {
    fontSize: 12,
    color: '#666',
  },
  weatherIcon: {
    width: 32,
    height: 38,
  },
  diagnosisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
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
    letterSpacing: 0.3,
  },
  disease: {
    color: '#666',
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  more: {
    color: '#4CAF50',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
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
    fontSize: 18,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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

  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
});

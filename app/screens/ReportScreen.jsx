import React, { useContext, useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';
import {useNavigation, useRoute} from '@react-navigation/native';
import { apiService, getBaseURLForImages } from '../../services/api';

const { width } = Dimensions.get('window');

const ReportScreen = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Default static data
  const [reportData, setReportData] = useState({
    cropName: 'Rice Crop',
    imageUri: null, // Will use static image if null
    disease: 'Blast',
    causes: 'Fungal infection (Magnaporthe oryzae)',
    description: 'Rice, a cereal grain, serves as the staple food for over half of the global population, especially in Asia and Africa, where ample soil facilitates its growth.',
    symptoms: [
      'Lesions on leaves, stems, and panicles',
      'Dark spots with gray centers',
      'Can lead to complete crop loss'
    ],
    preventions: [
      'Plant resistant varieties.',
      'Ensure proper field drainage to minimize waterlogged conditions.',
      'Rotate crops to reduce pathogen buildup.',
      'Timely removal of crop residues.',
      'Avoid excessive nitrogen which increases susceptibility.',
      'Use proper spacing to reduce humidity.',
      'Monitor fields regularly for detection.',
      'Apply fungicides preventively.',
    ],
    confidence: null
  });

  const fetchPredictionDetails = async (predictionId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPredictionById(predictionId);
      
      if (response.data.success) {
        const predictionData = response.data.message;
        
        // Parse the prediction string to extract crop and disease
        const predictionParts = predictionData.prediction.split(' - ');
        const cropName = predictionParts[0];
        const diseaseName = predictionParts[1] || predictionData.prediction;
        
        // Construct full image URL
        const getImageUrl = (imagePath) => {
          if (!imagePath) return null;
          if (imagePath.startsWith('http')) {
            return imagePath;
          }
          const baseURL = getBaseURLForImages();
          return `${baseURL}${imagePath}`;
        };
        
        // Update the report data with API information
        setReportData({
          cropName: cropName,
          imageUri: getImageUrl(predictionData.image),
          disease: diseaseName,
          causes: 'AI-detected disease based on image analysis',
          description: `${cropName} is a common agricultural crop that can be affected by various diseases. This analysis was performed using machine learning to identify potential health issues.`,
          symptoms: [
            'AI-detected symptoms based on visual analysis',
            'Please consult with an agricultural expert for detailed symptoms',
            'Regular monitoring is recommended for early detection'
          ],
          preventions: [
            'Consult with agricultural experts for specific treatment',
            'Implement proper crop management practices',
            'Monitor crop health regularly',
            'Use appropriate pesticides if recommended',
            'Maintain proper field conditions',
            'Follow local agricultural guidelines',
            'Consider crop rotation strategies',
            'Ensure proper irrigation and drainage.',
          ],
          confidence: parseFloat(predictionData.confidence), // Use actual confidence from API
          timestamp: predictionData.timestamp
        });
      } else {
        setError('Failed to fetch prediction details');
        Alert.alert('Error', 'Failed to load prediction details. Please try again.');
      }
    } catch (err) {
      console.error('Error fetching prediction details:', err);
      setError('Failed to load prediction details');
      Alert.alert('Error', 'Failed to load prediction details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if we received prediction results from Camera screen
  useEffect(() => {
    if (route.params?.predictionResult) {
      const { predictionResult } = route.params;
      
      // Parse the prediction string to extract crop and disease
      const predictionParts = predictionResult.prediction.split(' - ');
      const cropName = predictionParts[0];
      const diseaseName = predictionParts[1] || predictionResult.prediction;
      
      // Update the report data with dynamic information
      setReportData({
        cropName: cropName,
        imageUri: predictionResult.imageUri,
        disease: diseaseName,
        causes: 'AI-detected disease based on image analysis',
        description: `${cropName} is a common agricultural crop that can be affected by various diseases. This analysis was performed using machine learning to identify potential health issues.`,
        symptoms: [
          'AI-detected symptoms based on visual analysis',
          'Please consult with an agricultural expert for detailed symptoms',
          'Regular monitoring is recommended for early detection'
        ],
        preventions: [
          'Consult with agricultural experts for specific treatment',
          'Implement proper crop management practices',
          'Monitor crop health regularly',
          'Use appropriate pesticides if recommended',
          'Maintain proper field conditions',
          'Follow local agricultural guidelines',
          'Consider crop rotation strategies',
          'Ensure proper irrigation and drainage.',
        ],
        confidence: predictionResult.confidence
      });
      
      // Clear the route params to avoid duplicate processing
      navigation.setParams({ predictionResult: undefined });
    } else if (route.params?.diagnosis) {
      // Handle diagnosis data from DiagnosisScreen
      const { diagnosis } = route.params;
      
      // If we have a predictionId, fetch detailed data from API
      if (diagnosis.predictionId) {
        fetchPredictionDetails(diagnosis.predictionId);
      } else {
        // Use the passed diagnosis data directly
        setReportData({
          cropName: diagnosis.cropName,
          imageUri: diagnosis.imageUri,
          disease: diagnosis.disease,
          causes: 'Historical diagnosis data',
          description: `${diagnosis.cropName} is a common agricultural crop that can be affected by various diseases. This is a historical diagnosis record.`,
          symptoms: [
            'Historical symptoms data',
            'Please consult with an agricultural expert for detailed symptoms',
            'Regular monitoring is recommended for early detection'
          ],
          preventions: [
            'Consult with agricultural experts for specific treatment',
            'Implement proper crop management practices',
            'Monitor crop health regularly',
            'Use appropriate pesticides if recommended',
            'Maintain proper field conditions',
            'Follow local agricultural guidelines',
            'Consider crop rotation strategies',
            'Ensure proper irrigation and drainage.',
          ],
          confidence: diagnosis.confidence
        });
      }
      
      // Clear the route params to avoid duplicate processing
      navigation.setParams({ diagnosis: undefined });
    } else if (route.params?.diagnosisData) {
      // Handle diagnosis data from HomeScreen
      const { diagnosisData } = route.params;
      
      // If we have a predictionId, fetch detailed data from API
      if (route.params?.predictionId) {
        fetchPredictionDetails(route.params.predictionId);
      } else {
        // Use the passed diagnosis data directly
        setReportData({
          cropName: diagnosisData.cropName,
          imageUri: diagnosisData.imageUri,
          disease: diagnosisData.disease,
          causes: 'Historical diagnosis data',
          description: `${diagnosisData.cropName} is a common agricultural crop that can be affected by various diseases. This is a historical diagnosis record.`,
          symptoms: [
            'Historical symptoms data',
            'Please consult with an agricultural expert for detailed symptoms',
            'Regular monitoring is recommended for early detection'
          ],
          preventions: [
            'Consult with agricultural experts for specific treatment',
            'Implement proper crop management practices',
            'Monitor crop health regularly',
            'Use appropriate pesticides if recommended',
            'Maintain proper field conditions',
            'Follow local agricultural guidelines',
            'Consider crop rotation strategies',
            'Ensure proper irrigation and drainage.',
          ],
          confidence: diagnosisData.confidence
        });
      }
      
      // Clear the route params to avoid duplicate processing
      navigation.setParams({ diagnosisData: undefined, predictionId: undefined });
    }
      }, [route.params?.predictionResult, route.params?.diagnosis, route.params?.diagnosisData]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, {backgroundColor: theme.background}]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, {color: theme.text}]}>Loading diagnosis details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, {backgroundColor: theme.background}]}>
        <Text style={[styles.errorText, {color: theme.text}]}>{error}</Text>
        <TouchableOpacity 
          style={[styles.retryButton, {backgroundColor: theme.primary}]} 
          onPress={() => {
            if (route.params?.diagnosis?.predictionId) {
              fetchPredictionDetails(route.params.diagnosis.predictionId);
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.background}]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: theme.background}]}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, {color: theme.text}]}>{reportData.cropName}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Hero Section with Image */}
      <View style={styles.heroSection}>
        <Image 
          source={reportData.imageUri ? { uri: reportData.imageUri } : require('../../assets/Images/riceImage.png')} 
          style={styles.mainImage} 
        />
      </View>

      {/* Confidence Section */}
      {reportData.confidence && (
        <View style={[styles.confidenceSection, {backgroundColor: theme.card}]}>
          <View style={styles.confidenceRow}>
            <View style={styles.confidenceItem}>
              <MaterialIcons name="psychology" size={24} color={theme.primary} />
              <Text style={[styles.confidenceLabel, {color: theme.text}]}>AI Confidence</Text>
              <Text style={[styles.confidenceValue, {color: theme.primary}]}>
                {(reportData.confidence * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Disease Info Card */}
      <View style={[styles.diseaseCard, {backgroundColor: theme.card}]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="bug-report" size={24} color="#FF6B6B" />
          <Text style={[styles.cardTitle, {color: theme.text}]}>Disease Information</Text>
        </View>
        
        <View style={styles.diseaseInfo}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: theme.subtext}]}>Disease:</Text>
            <Text style={[styles.infoValue, {color: theme.text}]}>{reportData.disease}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, {color: theme.subtext}]}>Causes:</Text>
            <Text style={[styles.infoValue, {color: theme.text}]}>{reportData.causes}</Text>
          </View>
        </View>
      </View>

      {/* Symptoms Section */}
      <View style={[styles.sectionCard, {backgroundColor: theme.card}]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="visibility" size={24} color="#FF9800" />
          <Text style={[styles.cardTitle, {color: theme.text}]}>Symptoms</Text>
        </View>
        <View style={styles.symptomsList}>
          {reportData.symptoms.map((symptom, index) => (
            <View key={index} style={styles.symptomItem}>
              <View style={[styles.bulletPoint, {backgroundColor: '#FF9800'}]} />
              <Text style={[styles.symptomText, {color: theme.text}]}>{symptom}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Preventions Section */}
      <View style={[styles.sectionCard, {backgroundColor: theme.card}]}>
        <View style={styles.cardHeader}>
          <MaterialIcons name="shield" size={24} color="#4CAF50" />
          <Text style={[styles.cardTitle, {color: theme.text}]}>Prevention & Treatment</Text>
        </View>
        <View style={styles.preventionsList}>
          {reportData.preventions.map((item, i) => (
            <View key={i} style={styles.preventionItem}>
              <View style={[styles.bulletPoint, {backgroundColor: '#4CAF50'}]} />
              <Text style={[styles.preventionText, {color: theme.text}]}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.primaryButton, {backgroundColor: theme.primary}]}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Chatbox' })}
        >
          <MaterialIcons name="chat" size={20} color="white" />
          <Text style={styles.primaryButtonText}>Connect to AI Expert</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 35,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  heroSection: {
    position: 'relative',
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  confidenceSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  confidenceRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  confidenceItem: {
    alignItems: 'center',
    flex: 1,
  },
  confidenceLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  confidenceValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  diseaseCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    flex: 1,
  },
  audioButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  diseaseInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
    marginRight: 10,
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  sectionCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  symptomsList: {
    gap: 12,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  symptomText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  preventionsList: {
    gap: 12,
  },
  preventionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  preventionText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  actionButtons: {
    marginHorizontal: 20,
    marginBottom: 30,
    gap: 15,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
import React, { useState, useContext } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, Dimensions, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext';
import { apiService } from '../../services/api';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const CameraScreen = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Permission to access gallery is required to select images for disease analysis.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Permission to access camera is required to capture images for disease analysis.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const predictDisease = async () => {
    if (!image) {
      Alert.alert('No Image Selected', 'Please select or capture an image first to analyze for plant diseases.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.predictDisease(image);
      
      if (response.data.success) {
        // Navigate to Report screen with the prediction results
        navigation.navigate('Report', {
          predictionResult: {
            id: response.data.id,
            prediction: response.data.prediction,
            confidence: response.data.confidence,
            imageUri: image,
          }
        });
      } else {
        Alert.alert('Analysis Failed', response.data.message || 'Failed to analyze the image. Please try again.');
      }
    } catch (error) {
      console.error('Disease prediction error:', error);
      Alert.alert('Connection Error', 'Failed to connect to the analysis service. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar backgroundColor={theme.background} barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="camera-alt" size={32} color={theme.primary} />
          <Text style={[styles.headerTitle, {color: theme.text}]}>Plant Disease Scanner</Text>
          <Text style={[styles.headerSubtitle, {color: theme.subtext}]}>
            Capture or select an image to analyze for plant diseases
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Image Preview Section */}
        {image ? (
          <View style={styles.imageSection}>
            <View style={[styles.imageContainer, {backgroundColor: theme.card}]}>
              <Image source={{ uri: image }} style={styles.previewImage} />
              <TouchableOpacity style={styles.clearButton} onPress={clearImage}>
                <Ionicons name="close-circle" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.analyzeButton, {backgroundColor: theme.primary}]}
              onPress={predictDisease}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.analyzeButtonText}>Analyzing...</Text>
                </View>
              ) : (
                <View style={styles.analyzeContainer}>
                  <MaterialIcons name="psychology" size={24} color="white" />
                  <Text style={styles.analyzeButtonText}>Analyze Disease</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderSection}>
            <View style={[styles.placeholderContainer, {backgroundColor: theme.card}]}>
              <MaterialIcons name="photo-camera" size={64} color={theme.placeholder} />
              <Text style={[styles.placeholderTitle, {color: theme.text}]}>No Image Selected</Text>
              <Text style={[styles.placeholderSubtitle, {color: theme.subtext}]}>
                Capture a photo or select from gallery to start analysis
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons - Only show when no image is selected */}
        {!image && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, {backgroundColor: theme.primary}]}
              onPress={openCamera}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.buttonText}>Take Photo</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, {backgroundColor: theme.card, borderColor: theme.primary}]}
              onPress={pickImage}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="images" size={24} color={theme.primary} />
                <Text style={[styles.buttonText, {color: theme.primary}]}>Choose from Gallery</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Tips Section - Only show when no image is selected */}
        {!image && (
          <View style={[styles.tipsSection, {backgroundColor: theme.card}]}>
            <View style={styles.tipsHeader}>
              <MaterialIcons name="lightbulb" size={20} color="#FFA726" />
              <Text style={[styles.tipsTitle, {color: theme.text}]}>Tips for Better Results</Text>
            </View>
            <View style={styles.tipsList}>
              <Text style={[styles.tipText, {color: theme.subtext}]}>• Ensure good lighting for clear photos</Text>
              <Text style={[styles.tipText, {color: theme.subtext}]}>• Focus on the affected plant area</Text>
              <Text style={[styles.tipText, {color: theme.subtext}]}>• Keep the camera steady for sharp images</Text>
              <Text style={[styles.tipText, {color: theme.subtext}]}>• Include both healthy and diseased parts</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    resizeMode: 'cover',
  },
  clearButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 2,
  },
  analyzeButton: {
    marginTop: 20,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  placeholderSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 60,
  },
  placeholderContainer: {
    width: width * 0.8,
    height: width * 0.6,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    color: 'white',
  },
  tipsSection: {
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  tipsList: {
    gap: 6,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 18,
  },
});



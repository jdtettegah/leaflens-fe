import React, { useState, useContext } from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../ThemeContext';

const CameraScreen = () => {
  const [image, setImage] = useState(null);
  const { theme } = useContext(ThemeContext);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const openCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = () => {
    // Placeholder logic — replace with your actual upload logic (e.g., Firebase, backend)
    Alert.alert('Upload', 'Image uploaded successfully!');
  };

  return (
    <View style={[styles.container, {backgroundColor: theme.background}]}>

     

      <TouchableOpacity onPress={openCamera} style={[styles.pickButton, {backgroundColor:theme.primary}]}>
        <Text style={styles.buttonText}>Open Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={pickImage} style={[styles.pickButton, { backgroundColor: theme.primary }]}>
        <Text style={styles.buttonText}>Upload from Gallery</Text>
      </TouchableOpacity>

      {image ? (
        <>
          <Image source={{ uri: image }} style={styles.image} />

          <TouchableOpacity onPress={uploadImage} style={[styles.uploadButton, {backgroundColor: theme.primary}]}>
            <Text style={styles.uploadText}>Upload Image</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={[styles.placeholder, {backgroundColor: theme.imagePlaceholderBackground}]}>
          <Text style={[styles.placeholderText, {color: theme.text}]}>No image selected</Text>
        </View>
      )}
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0faf5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: -120,
    marginBottom: 80,
  },
  headerLogo: {
    display: 'flex',
    flexDirection: 'row',
  },
  logo: {
    width: 120,
    height: 120,
  },
  plogo: {
    width: 100,
    height: 100,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    color: '#004d00',
  },
  pickButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  uploadText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  placeholder: {
    width: 300,
    height: 300,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#004d00',
    borderWidth: 1,
  },
  placeholderText: {
    color: '#777',
    fontSize: 14,
  },
});



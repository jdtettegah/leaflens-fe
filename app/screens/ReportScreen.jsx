import React, { useContext } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';
import {useNavigation} from '@react-navigation/native';

const ReportScreen = () => {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation()
  return (
    <ScrollView style={[styles.container, {backgroundColor: theme.background}]}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: theme.background}]}>
        <Ionicons name="arrow-back" size={24} onPress={() => navigation.navigate('MainTabs')} styles={{color: theme.text}} />
        <Text style={[styles.title, {color: theme.text}]}>Rice Crop</Text>
      </View>

      {/* Crop Image */}
      <Image source={require('../../assets/Images/riceImage.png')} style={styles.mainImage} />

      {/* Crop Description */}
      <Text style={[styles.description, {color:theme.text}]}>
        Rice, a cereal grain, serves as the staple food for over half of the global population, especially in Asia and Africa, where ample soil facilitates its growth.
      </Text>

      {/* Disease Info */}
      <View style={styles.infoBox}>
        <Text style={[styles.disease, {color: theme.text}]}><Text style={[styles.bold, {color: theme.text}]}>Disease:</Text> Blast</Text>
        <Text style={[styles.disease, {color: theme.text}]}><Text style={[styles.bold, {color: theme.text}]}>Causes:</Text> Fungal infection (Magnaporthe oryzae)</Text>
      </View>

      {/* Symptoms */}
      <Text style={[styles.sectionTitle, {color: theme.text}]}>Symptoms:</Text>
      <View style={styles.listBox}>
        <Text style={[styles.bullet, {color: theme.text}]}>{'\u2022'} Lesions on leaves, stems, and panicles</Text>
        <Text style={[styles.bullet, {color: theme.text}]}>{'\u2022'} Dark spots with gray centers</Text>
        <Text style={[styles.bullet, {color: theme.text}]}>{'\u2022'} Can lead to complete crop loss</Text>
      </View>

      

      {/* Preventions */}
      <View style={[styles.preventBox, {backgroundColor: theme.card}]}>
        <View style={styles.preventHeader}>
          <Text style={[styles.sectionTitle, {color: theme.text}]}>Preventions</Text>
          <Feather name="volume-2" size={20} />
        </View>
        {[
          'Plant resistant varieties.',
          'Ensure proper field drainage to minimize waterlogged conditions.',
          'Rotate crops to reduce pathogen buildup.',
          'Timely removal of crop residues.',
          'Avoid excessive nitrogen which increases susceptibility.',
          'Use proper spacing to reduce humidity.',
          'Monitor fields regularly for detection.',
          'Apply fungicides preventively.',
        ].map((item, i) => (
          <Text key={i} style={[styles.bullet, {color: theme.text}]}>{'\u2022'} {item}</Text>
        ))}
      </View>

      {/* Suggested Pesticides */}

      {/* CTA Buttons */}

      <TouchableOpacity style={styles.connectButton} onPress={() => navigation.navigate('ChatBox')}>
        <Text style={styles.connectButtonText}>Connect to AI Expert</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ReportScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  mainImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginVertical: 12,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  infoBox: {
    marginBottom: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  disease: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 8,
  },
  listBox: {
    marginBottom: 12,
  },
  bullet: {
    fontSize: 14,
    color: '#444',
    marginVertical: 2,
  },
  imageRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  smallImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  preventBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  preventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pesticideRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  pesticideBox: {
    alignItems: 'center',
    width: '30%',
  },
  pesticideImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginBottom: 4,
  },
  pesticideLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  greenButton: {
    backgroundColor: '#3BC27B',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  greenButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  shareButton: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
  },
  shareButtonText: {
    color: '#333',
  },
  connectButton: {
    backgroundColor: '#A67C00',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
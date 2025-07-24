import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  const goBack = () => {
    navigation.replace('MainTabs');
  };

  const menuItems = [
    'Settings',
    'Give feedback',
    'Recommend LeafLens',
    'Contact & social',
    'Tutorial',
    'Theme',
  ];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
    >
      {/* Back Arrow */}
      <TouchableOpacity style={styles.backIcon} onPress={goBack}>
        <Ionicons name="arrow-back" size={24} color={theme.icon} />
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={require('../../assets/Images/profileIcon.png')}
          style={styles.profileImage}
        />
        <Text style={[styles.name, { color: theme.text }]}>mr_johnson</Text>
        <Text style={[styles.description, { color: theme.text }]}>
          Hi I am an agriculture student at KNUST
        </Text>
        <TouchableOpacity style={[styles.editButton, { borderColor: 'green' }]}>
          <Text style={[styles.editText, { color: 'green' }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Options */}
      <View style={[styles.menu, { borderTopColor: theme.border }]}>
        {menuItems.map((item, index) => (
          <View
            key={index}
            style={[styles.menuItem, { borderBottomColor: theme.border }]}
          >
            {item === 'Theme' ? (
              <>
                <Text style={[styles.menuText, { color: theme.text }]}>
                  {theme.mode === 'dark' ? 'Light Theme' : 'Dark Theme'}
                </Text>
                <Switch
                  value={theme.mode === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#aaa', true: '#4caf50' }}
                  thumbColor={theme.mode === 'dark' ? '#fff' : '#f4f3f4'}
                />
              </>
            ) : (
              <>
                <Text style={[styles.menuText, { color: theme.text }]}>{item}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.icon} />
              </>
            )}
          </View>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={[styles.logoutButton]}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  backIcon: {
    marginBottom: 10,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  description: {
    textAlign: 'center',
    marginVertical: 4,
  },
  editButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginTop: 8,
  },
  editText: {
    fontWeight: '600',
  },
  menu: {
    borderTopWidth: 1,
    paddingTop: 20,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: 'green',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

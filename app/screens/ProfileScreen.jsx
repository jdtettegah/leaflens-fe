import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Dimensions,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../ThemeContext';
import { apiService } from '../../services/api';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const [userDetails, setUserDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      // Try to get profile data from the profile endpoint first
      try {
        const response = await apiService.getProfile();
        if (response.data.success) {
          const profileData = response.data.message;
          const userData = profileData.user;
          
          setUserDetails({
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email || '',
            phone: profileData.phone_number || '',
            location: profileData.location || '',
          });
          return; // Exit early if profile data is successfully loaded
        }
      } catch (profileError) {
        console.log('Profile endpoint not available, falling back to user data');
      }
      
      // Fallback to current user data
      const user = await apiService.getCurrentUser();
      
      if (user) {
        setUserDetails({
          firstName: user.first_name || user.firstName || '',
          lastName: user.last_name || user.lastName || '',
          email: user.email || '',
          phone: user.phone_number || user.phone || '',
          location: user.location || '',
        });
      } else {
        // Final fallback to static data
        setUserDetails({
          firstName: 'John',
          lastName: 'Johnson',
          email: 'john.johnson@email.com',
          phone: '+233 24 123 4567',
          location: 'Kumasi, Ghana',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Fallback to static data if API fails
      setUserDetails({
        firstName: 'John',
        lastName: 'Johnson',
        email: 'john.johnson@email.com',
        phone: '+233 24 123 4567',
        location: 'Kumasi, Ghana',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      setSaving(true);
      
      console.log('updateProfile called with data:', updatedData);
      
      // Separate user data (first_name, last_name) from profile data (phone_number, location)
      const userData = {};
      const profileData = {};
      
      if (updatedData.firstName) userData.first_name = updatedData.firstName;
      if (updatedData.lastName) userData.last_name = updatedData.lastName;
      if (updatedData.phone) profileData.phone_number = updatedData.phone;
      if (updatedData.location) profileData.location = updatedData.location;
      
      console.log('Separated userData:', userData);
      console.log('Separated profileData:', profileData);
      
      let updateSuccess = false;
      
      // Update user information (first name, last name) if needed
      if (Object.keys(userData).length > 0) {
        try {
          console.log('Attempting to update user info with data:', userData);
          const userResponse = await apiService.updateUserInfo(userData);
          console.log('User update response:', userResponse.data);
          if (userResponse.data.success) {
            console.log('User info updated successfully');
            updateSuccess = true;
          } else {
            console.log('User update failed:', userResponse.data.message);
          }
        } catch (userError) {
          console.log('User update API error:', userError.response?.data || userError.message);
        }
      }
      
      // Update profile information (phone, location) if needed
      if (Object.keys(profileData).length > 0) {
        try {
          const profileResponse = await apiService.updateProfile(profileData);
          if (profileResponse.data.success) {
            console.log('Profile info updated successfully');
            updateSuccess = true;
          }
        } catch (profileError) {
          console.log('Profile update API not available:', profileError);
        }
      }
      
      if (updateSuccess) {
        Alert.alert('Success', 'Profile updated successfully');
        // Refresh profile data
        await fetchProfile();
        return;
      }
      
      // Fallback to local state update if APIs are not available
      console.log('Profile update data:', updatedData);
      
      // Update local state immediately for better UX
      setUserDetails(prev => ({
        ...prev,
        ...updatedData
      }));
      
      // Show success message
      Alert.alert('Success', 'Profile updated successfully');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout pressed') }
      ]
    );
  };

  const toggleEditMode = async () => {
    if (isEditing) {
      // Save all changes when exiting edit mode
      const updatedData = {};
      
      // Only include fields that have been modified
      if (editingField && tempValue.trim()) {
        updatedData[editingField] = tempValue.trim();
      }

      console.log('toggleEditMode - editingField:', editingField);
      console.log('toggleEditMode - tempValue:', tempValue);
      console.log('toggleEditMode - updatedData:', updatedData);

      if (Object.keys(updatedData).length > 0) {
        await updateProfile(updatedData);
      }
      
      // Always reset to edit mode after saving
      setIsEditing(false);
      setEditingField(null);
      setTempValue('');
    } else {
      setIsEditing(true);
    }
  };

  const startEditing = (field, value) => {
    if (field === 'email') return; // Email is locked
    
    // If we're already editing a different field, save the current field first
    if (editingField && editingField !== field && tempValue.trim() && tempValue.trim() !== userDetails[editingField]) {
      const updatedData = { [editingField]: tempValue.trim() };
      updateProfile(updatedData);
    }
    
    setEditingField(field);
    setTempValue(value);
  };



  const userFields = [
    {
      key: 'firstName',
      label: 'First Name',
      icon: 'person-outline',
      value: userDetails.firstName,
      apiField: 'first_name',
    },
    {
      key: 'lastName',
      label: 'Last Name',
      icon: 'person-outline',
      value: userDetails.lastName,
      apiField: 'last_name',
    },
    {
      key: 'email',
      label: 'Email',
      icon: 'mail-outline',
      value: userDetails.email,
      keyboardType: 'email-address',
      locked: true,
      apiField: 'email',
    },
    {
      key: 'phone',
      label: 'Phone',
      icon: 'call-outline',
      value: userDetails.phone,
      keyboardType: 'phone-pad',
      apiField: 'phone',
    },
    {
      key: 'location',
      label: 'Location',
      icon: 'location-outline',
      value: userDetails.location,
      apiField: 'location',
    },

  ];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#4caf50" />
        <Text style={[styles.loadingText, { color: theme.text }]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Back Arrow */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backIcon} onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color={theme.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#f8f9fa' }]}>
        <View style={styles.profileImageContainer}>
          <Image
            source={require('../../assets/Images/profileIcon.png')}
            style={styles.profileImage}
          />
          <View style={styles.onlineIndicator} />
        </View>
        <Text style={[styles.name, { color: theme.text }]}>{userDetails.firstName} {userDetails.lastName}</Text>
        <Text style={[styles.description, { color: theme.textSecondary || '#666' }]}>
          Welcome to LeafLens
        </Text>
      </View>

      {/* User Details Section */}
      <View style={[styles.detailsSection, { backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#f8f9fa' }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Personal Information</Text>
          <TouchableOpacity 
            style={[styles.editHeaderButton, { backgroundColor: isEditing ? '#ff4757' : theme.mode === 'dark' ? '#4caf50' : '#e8f5e8' }]} 
            onPress={toggleEditMode}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={isEditing ? '#fff' : theme.mode === 'dark' ? '#fff' : '#4caf50'} />
            ) : (
              <Ionicons 
                name={isEditing ? "checkmark" : "pencil"} 
                size={16} 
                color={isEditing ? '#fff' : theme.mode === 'dark' ? '#fff' : '#4caf50'} 
              />
            )}
            <Text style={[styles.editHeaderText, { color: isEditing ? '#fff' : theme.mode === 'dark' ? '#fff' : '#4caf50' }]}>
              {saving ? 'Saving...' : (isEditing ? 'Save' : 'Edit')}
            </Text>
          </TouchableOpacity>
        </View>
        {userFields.map((field, index) => (
          <TouchableOpacity
            key={field.key}
            style={[
              styles.detailItem,
              { borderBottomColor: theme.mode === 'dark' ? '#404040' : '#e0e0e0' },
              index === userFields.length - 1 && { borderBottomWidth: 0 },
              field.locked && { opacity: 0.6 }
            ]}
            activeOpacity={field.locked ? 1 : 0.7}
            onPress={() => isEditing && !field.locked && startEditing(field.key, field.value)}
          >
            <View style={styles.detailLeft}>
              <View style={[styles.detailIcon, { backgroundColor: theme.mode === 'dark' ? '#4caf50' : '#e8f5e8' }]}>
                <Ionicons 
                  name={field.icon} 
                  size={18} 
                  color={theme.mode === 'dark' ? '#fff' : '#4caf50'} 
                />
              </View>
              <View style={styles.detailTextContainer}>
                <View style={styles.labelContainer}>
                  <Text style={[styles.detailLabel, { color: theme.textSecondary || '#666' }]}>{field.label}</Text>
                  {field.locked && (
                    <View style={styles.lockedIndicator}>
                      <Ionicons name="lock-closed" size={12} color={theme.textSecondary || '#666'} />
                    </View>
                  )}
                </View>
                                 {editingField === field.key ? (
                   <TextInput
                     style={[styles.detailInput, { color: theme.text, borderColor: theme.mode === 'dark' ? '#4caf50' : '#4caf50' }]}
                     value={tempValue}
                     onChangeText={setTempValue}
                     placeholder={`Enter ${field.label.toLowerCase()}`}
                     placeholderTextColor={theme.textSecondary || '#999'}
                     keyboardType={field.keyboardType || 'default'}
                     multiline={field.multiline}
                     autoFocus
                     onBlur={async () => {
                       if (tempValue.trim() && tempValue.trim() !== field.value) {
                         const updatedData = { [field.key]: tempValue.trim() };
                         await updateProfile(updatedData);
                       }
                       setEditingField(null);
                       setTempValue('');
                     }}
                   />
                 ) : (
                  <Text style={[styles.detailValue, { color: theme.text }]} numberOfLines={field.multiline ? 3 : 1}>
                    {field.value || 'Not set'}
                  </Text>
                )}
              </View>
            </View>
            {isEditing && !field.locked && editingField !== field.key && (
              <Ionicons name="chevron-forward" size={16} color={theme.icon} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings Section */}
      <View style={[styles.settingsSection, { backgroundColor: theme.mode === 'dark' ? '#2a2a2a' : '#f8f9fa' }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Settings</Text>
        <View style={[styles.settingItem, { borderBottomColor: theme.mode === 'dark' ? '#404040' : '#e0e0e0' }]}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: theme.mode === 'dark' ? '#4caf50' : '#e8f5e8' }]}>
              <Ionicons name="moon-outline" size={18} color={theme.mode === 'dark' ? '#fff' : '#4caf50'} />
            </View>
            <View style={styles.settingTextContainer}>
              <Text style={[styles.settingText, { color: theme.text }]}>Dark Theme</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary || '#666' }]}>
                Switch between light and dark mode
              </Text>
            </View>
          </View>
          <Switch
            value={theme.mode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#e0e0e0', true: '#4caf50' }}
            thumbColor={theme.mode === 'dark' ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#e0e0e0"
          />
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.mode === 'dark' ? '#ff4757' : '#ff6b6b' }]} activeOpacity={0.8} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    marginBottom: 20,
  },
  backIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#4caf50',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4caf50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  name: {
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  editText: {
    fontWeight: '600',
    fontSize: 16,
  },
  detailsSection: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  editHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  editHeaderText: {
    fontWeight: '600',
    fontSize: 14,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  detailTextContainer: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lockedIndicator: {
    marginLeft: 6,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailInput: {
    fontSize: 16,
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  settingsSection: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 25,
    marginBottom: 30,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

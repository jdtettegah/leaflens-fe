import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { ThemeContext } from '../ThemeContext'; // Make sure the path is correct

import HomeScreen from '../screens/HomeScreen';
import DiagnosisScreen from '../screens/DiagnosisScreen';
import CameraScreen from '../screens/CameraScreen';
import ChatboxScreen from '../screens/ChatboxScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import icons
import HomeIcon from '../../assets/Images/homeIcon.png';
import DiagnosisIcon from '../../assets/Images/diagnosisIcon.png';
import CameraIcon from '../../assets/Images/cameraIcon.png'; 
import ChatboxIcon from '../../assets/Images/chatboxIcon.png';
import ProfileIcon from '../../assets/Images/profileIcon.png';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.card,
          height: 65,
          borderTopWidth: 0.5,
          borderTopColor: theme.border,
        },
        tabBarIcon: ({ focused }) => {
          let icon;

          switch (route.name) {
            case 'Home':
              icon = HomeIcon;
              break;
            case 'Diagnosis':
              icon = DiagnosisIcon;
              break;
            case 'Camera':
              icon = CameraIcon;
              break;
            case 'Chatbox':
              icon = ChatboxIcon;
              break;
            case 'Profile':
              icon = ProfileIcon;
              break;
            default:
              icon = HomeIcon;
          }

          return (
            <Image
              source={icon}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? theme.primary : theme.placeholder,
              }}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Diagnosis" component={DiagnosisScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Chatbox" component={ChatboxScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;

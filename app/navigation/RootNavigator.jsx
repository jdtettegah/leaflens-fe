import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import MainTabs from './MainTabs';
import ReportScreen from '../screens/ReportScreen';
import CameraScreen from '../screens/CameraScreen';
import ChatboxScreen from '../screens/ChatboxScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000); // 3-second splash
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!onboarded ? (
        <Stack.Screen name="Onboarding">
          {(props) => <OnboardingScreen {...props} onDone={() => setOnboarded(true)} />}
        </Stack.Screen>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Camera" component={CameraScreen}/>
          <Stack.Screen name="ChatBox" component={ChatboxScreen}/>
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;

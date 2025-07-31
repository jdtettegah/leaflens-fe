import React, { useState, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../ThemeContext';
import { apiService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons'; // Eye icon from expo

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { theme } = useContext(ThemeContext);

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiService.login({
        email: email.trim(),
        password: password,
      });

      if (response.data.success) {
        await AsyncStorage.setItem('accessToken', response.data.message.access);
        await AsyncStorage.setItem('refreshToken', response.data.message.refresh);
        navigation.replace('MainTabs');
      } else {
        alert('Login failed. Please check your credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred while logging in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 40}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.innerContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Image
              source={require('../../assets/Images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: theme.text }]}>Welcome Back!</Text>

            {/* Email Input */}
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor:
                    focusedInput === 'Email' ? theme.primary : theme.border,
                },
              ]}
              placeholder="Email"
              placeholderTextColor={theme.placeholder}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors((prev) => ({ ...prev, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('Email')}
              onBlur={() => setFocusedInput(null)}
              editable={!loading}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Password Input with Eye Icon */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor:
                      focusedInput === 'Password' ? theme.primary : theme.border,
                  },
                ]}
                placeholder="Password"
                placeholderTextColor={theme.placeholder}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors((prev) => ({ ...prev, password: '' }));
                }}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedInput('Password')}
                onBlur={() => setFocusedInput(null)}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color={theme.placeholder}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.primary }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginText}>Log In</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')} disabled={loading}>
              <Text style={[styles.signupText, { color: theme.text }]}>
                Don’t have an account?{' '}
                <Text style={{ color: theme.primary }}>Sign up</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  logo: {
    height: 150,
    width: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    padding: 12,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginVertical: 10,
  },
  passwordInput: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  loginButton: {
    marginTop: 20,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
  },
  signupText: {
    marginTop: 16,
    fontSize: 14,
  },
  errorText: {
    width: '100%',
    color: 'red',
    fontSize: 13,
    marginTop: -6,
    marginBottom: 6,
    textAlign: 'left',
  },
});

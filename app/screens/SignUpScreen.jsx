import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../ThemeContext';
import { apiService } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

// Capitalize helper
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const SignUpScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { theme } = useContext(ThemeContext);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignup = async () => {
    setErrors({});
    if (!firstName || !lastName || !email || !username || !password || !confirmPassword) {
      setErrors({ form: 'Please fill all required fields.' });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters.' });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match.' });
      return;
    }

    const signupData = {
      first_name: firstName,
      middle_name: middleName || '',
      last_name: lastName,
      email,
      username,
      password,
    };

    setIsLoading(true);

    try {
      const response = await apiService.register(signupData);
      Alert.alert(
        'Success',
        'Account created. Please check your email to verify your account.'
      );
      navigation.replace('Login');
    } catch (error) {
      const newErrors = {};
      const messages = [];

      if (error.response && error.response.data) {
        const data = error.response.data;

        if (data.email && Array.isArray(data.email)) {
          const msg = capitalize(data.email[0]);
          newErrors.email = msg;
          messages.push(`- ${msg}`);
        }

        if (data.username && Array.isArray(data.username)) {
          const msg = capitalize(data.username[0]);
          newErrors.username = msg;
          messages.push(`- ${msg}`);
        }

        if (data.password && Array.isArray(data.password)) {
          const msg = capitalize(data.password[0]);
          newErrors.password = msg;
          messages.push(`- ${msg}`);
        }

        if (data.non_field_errors && Array.isArray(data.non_field_errors)) {
          const msg = capitalize(data.non_field_errors[0]);
          messages.push(`- ${msg}`);
        }
      } else {
        messages.push('- An unexpected error occurred.');
      }

      if (messages.length > 0) {
        Alert.alert('Signup Failed', messages.join('\n'));
      }

      setErrors((prev) => ({ ...prev, ...newErrors }));
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
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
            <Text style={[styles.title, { color: theme.text }]}>Create an Account</Text>

            {errors.form && <Text style={styles.error}>{errors.form}</Text>}

            {/* First Name */}
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: focusedInput === 'firstName' ? theme.primary : theme.border,
              }]}
              placeholder="First Name *"
              placeholderTextColor={theme.placeholder}
              value={firstName}
              onChangeText={setFirstName}
              editable={!isLoading}
              onFocus={() => setFocusedInput('firstName')}
              onBlur={() => setFocusedInput(null)}
            />

            {/* Middle Name */}
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: focusedInput === 'middleName' ? theme.primary : theme.border,
              }]}
              placeholder="Middle Name (optional)"
              placeholderTextColor={theme.placeholder}
              value={middleName}
              onChangeText={setMiddleName}
              editable={!isLoading}
              onFocus={() => setFocusedInput('middleName')}
              onBlur={() => setFocusedInput(null)}
            />

            {/* Last Name */}
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: focusedInput === 'lastName' ? theme.primary : theme.border,
              }]}
              placeholder="Last Name *"
              placeholderTextColor={theme.placeholder}
              value={lastName}
              onChangeText={setLastName}
              editable={!isLoading}
              onFocus={() => setFocusedInput('lastName')}
              onBlur={() => setFocusedInput(null)}
            />

            {/* Email */}
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: focusedInput === 'email' ? theme.primary : theme.border,
              }]}
              placeholder="Email *"
              placeholderTextColor={theme.placeholder}
              value={email}
              onChangeText={setEmail}
              editable={!isLoading}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            {/* Username */}
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBackground,
                color: theme.text,
                borderColor: focusedInput === 'username' ? theme.primary : theme.border,
              }]}
              placeholder="Username *"
              placeholderTextColor={theme.placeholder}
              value={username}
              onChangeText={setUsername}
              editable={!isLoading}
              autoCapitalize="none"
              onFocus={() => setFocusedInput('username')}
              onBlur={() => setFocusedInput(null)}
            />
            {errors.username && <Text style={styles.error}>{errors.username}</Text>}

            {/* Password */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: focusedInput === 'password' ? theme.primary : theme.border,
                }]}
                placeholder="Password *"
                placeholderTextColor={theme.placeholder}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
                secureTextEntry={!showPassword}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme.icon || '#999'}
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.error}>{errors.password}</Text>}

            {/* Confirm Password */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: focusedInput === 'confirmPassword' ? theme.primary : theme.border,
                }]}
                placeholder="Confirm Password *"
                placeholderTextColor={theme.placeholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!isLoading}
                secureTextEntry={!showConfirmPassword}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color={theme.icon || '#999'}
                  style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.signUpButton, { backgroundColor: theme.primary }]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.signUpText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Login link */}
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginLink, { color: theme.text }]}>
                Already have an account? <Text style={{ color: theme.primary }}>Log in</Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
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
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  passwordContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 8,
    paddingRight: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
  },
  signUpButton: {
    marginTop: 20,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
  },
  signUpText: {
    color: '#fff',
    fontSize: 18,
  },
  loginLink: {
    marginTop: 16,
    fontSize: 14,
  },
  error: {
    color: 'red',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: -6,
    marginBottom: 6,
  },
});

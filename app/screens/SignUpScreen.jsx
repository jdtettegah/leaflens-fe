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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../ThemeContext';
import { apiService } from '../../services/api';

const SignUpScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  const { theme } = useContext(ThemeContext);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !username || !password) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
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

    try {
      const response = await apiService.register(signupData);
      Alert.alert(
        'Success',
        'Account created. Please check your email to verify your account.'
      );
      navigation.replace('Login');
    } catch (error) {
      Alert.alert(
        'Signup Failed',
        error.response?.data?.message ||
          'An error occurred during signup. Check email and try again.'
      );
    }
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

            {[
              { placeholder: 'First Name *', value: firstName, setter: setFirstName, key: 'firstName' },
              { placeholder: 'Middle Name (optional)', value: middleName, setter: setMiddleName, key: 'middleName' },
              { placeholder: 'Last Name *', value: lastName, setter: setLastName, key: 'lastName' },
              { placeholder: 'Email *', value: email, setter: setEmail, key: 'email', keyboardType: 'email-address' },
              { placeholder: 'Username *', value: username, setter: setUsername, key: 'username' },
              { placeholder: 'Password *', value: password, setter: setPassword, key: 'password', secureTextEntry: true },
            ].map(({ placeholder, value, setter, key, keyboardType, secureTextEntry }) => (
              <TextInput
                key={key}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: focusedInput === key ? theme.primary : theme.border,
                  },
                ]}
                placeholder={placeholder}
                placeholderTextColor={theme.placeholder}
                value={value}
                onChangeText={setter}
                keyboardType={keyboardType}
                autoCapitalize="none"
                secureTextEntry={secureTextEntry}
                onFocus={() => setFocusedInput(key)}
                onBlur={() => setFocusedInput(null)}
              />
            ))}

            <TouchableOpacity
              style={[styles.signUpButton, { backgroundColor: theme.primary }]}
              onPress={handleSignup}
            >
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>

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
    paddingBottom: 40, // allows space for keyboard
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
  signUpButton: {
    marginTop: 20,
    paddingVertical: 12,
    width: '100%',
    borderRadius: 8,
  },
  signUpText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  loginLink: {
    marginTop: 16,
    fontSize: 14,
  },
});

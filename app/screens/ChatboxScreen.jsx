import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';

const ChatboxScreen = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const { theme } = useContext(ThemeContext);

  const getBotReply = (userText) => {
    if (userText.toLowerCase().includes('hello')) {
      return 'Hi there! How can I assist with your plant today?';
    }
    if (userText.toLowerCase().includes('disease')) {
      return 'Please describe the symptoms or upload a photo.';
    }
    return 'Thanks for your message! Let me look into that.';
  };

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage = {
      _id: Date.now().toString(),
      text: inputText,
      createdAt: new Date(),
      user: {
        _id: 1,
        name: 'User',
      },
    };

    setMessages((previousMessages) => [newMessage, ...previousMessages]);
    setInputText('');

    // Simulate bot reply after 1.5 seconds
    setTimeout(() => {
      const botReply = {
        _id: Date.now().toString() + '-bot',
        text: getBotReply(inputText),
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'PlantBot',
        },
      };

      setMessages((previousMessages) => [botReply, ...previousMessages]);
    }, 1500);
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  const renderWelcomeScreen = () => (
    <View style={[styles.welcomeContainer, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Image source={require('../../assets/Images/lensAi.png')} style={styles.lensAi} />
      </View>
      <Text style={[styles.welcomeTitle, { color: theme.text }]}>What can I help with?</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]}>
          <Ionicons name="image-outline" size={20} color="#22c55e" />
          <Text style={[styles.actionText, { color: theme.text }]}>Capture image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]}>
          <Ionicons name="create-outline" size={20} color="#d946ef" />
          <Text style={[styles.actionText, { color: theme.text }]}>Write about a plant disease</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]}>
          <Ionicons name="document-text-outline" size={20} color="#f97316" />
          <Text style={[styles.actionText, { color: theme.text }]}>Read about a plant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.card }]}>
          <Ionicons name="ellipsis-horizontal" size={20} color="#6366f1" />
          <Text style={[styles.actionText, { color: theme.text }]}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderChatMessages = () => (
    <View style={[{ flex: 1 }, { backgroundColor: theme.background }]}>
      <View style={[styles.chatHeaderRow, { backgroundColor: theme.background }]}>
        <Image source={require('../../assets/Images/lensAi.png')} style={styles.chatLogo} />
        <TouchableOpacity onPress={handleNewChat} style={styles.newChatButton}>
          <Ionicons name="refresh-circle" size={24} color="#22c55e" />
          <Text style={[styles.newChatText, { color: theme.text }]}>New Chat</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={messages}
        inverted
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ paddingVertical: 10 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.user._id === 1 ? styles.userMsg : styles.botMsg,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
      />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {messages.length === 0 ? renderWelcomeScreen() : renderChatMessages()}
          <View style={[styles.inputContainer, { backgroundColor: theme.background }]}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              style={styles.input}
              placeholder="Ask anything"
              placeholderTextColor="#999"
            />
            <TouchableOpacity onPress={handleSendMessage}>
              <Ionicons name="send" size={24} color="#22c55e" style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ChatboxScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginTop: 20,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: -25,
    marginRight: 10,
  },
  newChatText: {
    marginLeft: 4,
    fontSize: 14,
    color: 'Black',
    fontWeight: 'bold',
  },
  lensAi: {
    height: 60,
    width: 150,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 30,
    marginTop: 180,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  actionText: {
    color: '#111',
    marginTop: 4,
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'green',
    marginHorizontal: 5,
  },
  input: {
    flex: 1,
    color: '#111',
    height: 48,
    marginHorizontal: 10,
  },
  sendIcon: {
    paddingLeft: 8,
  },
  messageContainer: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMsg: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcfce7',
    borderTopRightRadius: 0,
    marginRight: 10,
  },
  botMsg: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    borderTopLeftRadius: 0,
    marginLeft: 10,
  },
  messageText: {
    color: '#111',
  },
  chatLogo: {
    width: 140,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: -25,
  },
});

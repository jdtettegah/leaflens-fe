import React, { useState, useContext, useCallback, useRef, useEffect } from 'react';
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
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../ThemeContext';
import { apiService } from '../../services/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatboxScreen = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const { theme } = useContext(ThemeContext);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Sample quick questions for the welcome screen
  const quickQuestions = [
    "How do I care for a Monstera plant?",
    "What's wrong with my plant's yellow leaves?",
    "Best indoor plants for low light?",
    "How often should I water my succulents?"
  ];

  // Handle sending a message
  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isSending) return;

    const userMsg = createMessage(inputText, 1, 'User');
    setMessages(prev => [userMsg, ...prev]);
    const userMessage = inputText;
    setInputText('');
    setIsSending(true);

    try {
      const response = sessionId 
        ? await apiService.continueChat(sessionId, userMessage)
        : await apiService.startChat(userMessage);
      
      if (!sessionId && response.data?.session_id) {
        setSessionId(response.data.session_id);
      }

      const botMsg = createMessage(
        response.data?.response || "I'm sorry, I didn't get that. Could you rephrase?", 
        2, 
        'PlantBot'
      );
      setMessages(prev => [botMsg, ...prev]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = createMessage(
        "Sorry, I'm having trouble connecting. Please check your internet and try again.",
        2,
        'PlantBot'
      );
      setMessages(prev => [errorMsg, ...prev]);
    } finally {
      setIsSending(false);
    }
  };

  // Helper function to create message objects
  const createMessage = (text, userId, userName) => ({
    _id: `${Date.now()}${userId === 2 ? '-bot' : ''}`,
    text,
    createdAt: new Date(),
    user: {
      _id: userId,
      name: userName,
    },
  });

  // Start a new chat session
  const handleNewChat = () => {
    if (isSending) return;
    
    if (messages.length > 0) {
      Alert.alert(
        'Start new chat',
        'Are you sure you want to start a new chat? This will clear the current conversation.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'New Chat', onPress: () => {
            setMessages([]);
            setSessionId(null);
          }},
        ]
      );
    }
  };

  // Handle quick question selection
  const handleQuickQuestion = (question) => {
    setInputText(question);
  };

  // Optimized message component
  const ChatMessage = React.memo(({ message }) => {
    const isUser = message.user._id === 1;
    const bubbleStyle = isUser 
      ? [styles.userMsg, { backgroundColor: theme.userMessageBg || '#dcfce7' }]
      : [styles.botMsg, { backgroundColor: theme.botMessageBg || '#e0e7ff' }];
    
    return (
      <View style={[styles.messageContainer, bubbleStyle]}>
        {!isUser && (
          <Text style={[styles.botName, { color: theme.botNameText || '#4f46e5' }]}>
            {message.user.name}
          </Text>
        )}
        <Text style={[styles.messageText, { color: theme.messageText || '#111' }]}>
          {message.text}
        </Text>
        <Text style={[styles.timeText, { color: theme.timeText || '#666' }]}>
          {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  });

  const renderMessage = useCallback(({ item }) => <ChatMessage message={item} />, []);

  // Welcome screen with quick questions
  const renderWelcomeScreen = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.welcomeContainer, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.background }]}>
          <Image 
            source={require('../../assets/Images/lensAi.png')} 
            style={styles.lensAi} 
            resizeMode="contain"
          />
        </View>
        <Text style={[styles.welcomeTitle, { color: theme.text }]}>
          How can I help with your plants today?
        </Text>
        
        <View style={styles.quickQuestionsContainer}>
          {quickQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickQuestionButton, { backgroundColor: theme.quickQuestionBg || '#f3f4f6' }]}
              onPress={() => handleQuickQuestion(question)}
            >
              <Text style={[styles.quickQuestionText, { color: theme.text }]}>
                {question}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );

  // Chat messages screen
  const renderChatMessages = () => (
    <View style={[{ flex: 1 }, { backgroundColor: theme.background }]}>
      <View style={[styles.chatHeaderRow, { 
        backgroundColor: theme.background,
        paddingTop: insets.top + 10 
      }]}>
        <Image 
          source={require('../../assets/Images/lensAi.png')} 
          style={styles.chatLogo} 
          resizeMode="contain"
        />
        <TouchableOpacity 
          onPress={handleNewChat} 
          style={styles.newChatButton}
          disabled={isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#999" />
          ) : (
            <>
              <Ionicons 
                name="refresh-circle" 
                size={24} 
                color={theme.primary || '#22c55e'} 
              />
              <Text style={[styles.newChatText, { color: theme.text }]}>
                New Chat
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        inverted
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        contentContainerStyle={{ paddingVertical: 10 }}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={Platform.OS === 'android'}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Main content area */}
      {messages.length === 0 ? renderWelcomeScreen() : renderChatMessages()}
      
      {/* Input container with keyboard avoidance */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({ 
          ios: insets.bottom + 10, 
          android: 20 
        })}
      >
        <View style={[
          styles.inputContainer, 
          { 
            backgroundColor: theme.inputBg || theme.background,
            borderColor: theme.inputBorder || '#d1d5db',
            marginBottom: insets.bottom,
            marginHorizontal: 10,
          }
        ]}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            style={[
              styles.input, 
              { 
                color: theme.inputText || theme.text || '#111',
                maxHeight: 120,
              }
            ]}
            placeholder="Message PlantBot..."
            placeholderTextColor={theme.placeholder || '#999'}
            autoCapitalize="sentences"
            multiline
            editable={!isSending}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            blurOnSubmit={false}
          />
          
          <TouchableOpacity 
            onPress={handleSendMessage}
            disabled={inputText.trim() === '' || isSending}
            style={styles.sendButton}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#999" />
            ) : (
              <Ionicons 
                name="send" 
                size={24} 
                color={inputText.trim() === '' ? '#999' : theme.primary || '#22c55e'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 20,
    alignItems: 'center',
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  newChatText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  lensAi: {
    height: 80,
    width: 180,
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  quickQuestionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  quickQuestionButton: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    width: '100%',
  },
  quickQuestionText: {
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    minHeight: 50,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    includeFontPadding: false, // Better text vertical alignment
  },
  sendButton: {
    marginLeft: 8,
    padding: 6,
  },
  messageContainer: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userMsg: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
    marginRight: 15,
  },
  botMsg: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
    marginLeft: 15,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatLogo: {
    width: 120,
    height: 50,
  },
});

export default ChatboxScreen;
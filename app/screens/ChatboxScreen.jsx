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
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { theme } = useContext(ThemeContext);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Sample quick questions for the welcome screen
  const quickQuestions = [
    "What is blight disease?",
    "What is the best way to water my plants?",
    "What is the best way to fertilize my plants?",
    "What is the best way to prune my plants?"
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
        processGeminiResponse(response.data?.response) || "I'm sorry, I didn't get that. Could you rephrase?", 
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

  // Helper function to process Gemini API response and remove asterisks
  const processGeminiResponse = (text) => {
    if (!text) return text;
    
    // Remove asterisks used for bold formatting
    let processedText = text.replace(/\*\*(.*?)\*\*/g, '$1');
    
    // Also handle single asterisks for italic formatting
    processedText = processedText.replace(/\*(.*?)\*/g, '$1');
    
    // Handle any other markdown-like formatting that might come from Gemini
    processedText = processedText.replace(/`(.*?)`/g, '$1'); // Remove backticks for code
    processedText = processedText.replace(/_(.*?)_/g, '$1'); // Remove underscores for italic
    
    return processedText;
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

  // Fetch chat history from backend
  const fetchChatHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const response = await apiService.getChatHistory();
      if (response.data?.success) {
        console.log('Chat history data:', JSON.stringify(response.data.messages, null, 2));
        setChatHistory(response.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      Alert.alert('Error', 'Failed to load chat history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Handle chat history icon press
  const handleChatHistoryPress = () => {
    if (!showChatHistory) {
      fetchChatHistory();
    }
    setShowChatHistory(!showChatHistory);
  };

  // Load a specific chat session
  const loadChatSession = (sessionId) => {
    try {
      // Find the chat session in the existing chat history
      const selectedSession = chatHistory.find(session => session.session_id === sessionId);
      
      if (selectedSession && selectedSession.messages) {
        // Convert backend message format to frontend format and sort by actual timestamps
        const convertedMessages = selectedSession.messages
          .map((msg, index) => ({
            _id: msg.id ? `${msg.id}-${msg.sender}` : `${Date.now()}-${index}-${msg.sender}`,
            text: msg.message,
            createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            user: {
              _id: msg.sender === 'user' ? 1 : 2,
              name: msg.sender === 'user' ? 'User' : 'PlantBot',
            },
          }))
          .sort((a, b) => {
            // Sort by actual timestamp, ensuring proper chronological order
            const timeA = a.createdAt.getTime();
            const timeB = b.createdAt.getTime();
            return timeA - timeB; // Oldest first (first message sent by user will be first)
          });
        
        console.log('Loaded messages in chronological order:', convertedMessages.map(msg => ({
          sender: msg.user.name,
          text: msg.text.substring(0, 30) + '...',
          timestamp: msg.createdAt.toISOString()
        })));
        
        setMessages(convertedMessages);
        setSessionId(sessionId);
        setShowChatHistory(false);
      } else {
        Alert.alert('Error', 'Chat session not found');
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
      Alert.alert('Error', 'Failed to load chat session');
    }
  };

  // Delete a chat session
  const deleteChatSession = async (sessionIdToDelete) => {
    try {
      const response = await apiService.deleteChatSession(sessionIdToDelete);
      
      if (response.data?.success) {
        // Remove the deleted session from local state
        setChatHistory(prev => prev.filter(session => session.session_id !== sessionIdToDelete));
        
        // If the deleted session was the current one, clear the current chat
        if (sessionIdToDelete === sessionId) {
          setMessages([]);
          setSessionId(null);
        }
        
        Alert.alert('Success', 'Chat session deleted successfully');
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to delete chat session');
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
      Alert.alert('Error', 'Failed to delete chat session');
    }
  };

  // Handle delete button press with confirmation
  const handleDeleteChat = (sessionId) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this chat session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteChatSession(sessionId)
        },
      ]
    );
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
         paddingTop: (insets.top + 10) / 3 
       }]}>
                           <TouchableOpacity 
          onPress={handleChatHistoryPress}
          style={styles.chatHistoryButton}
          disabled={isLoadingHistory}
        >
          {isLoadingHistory ? (
            <ActivityIndicator size="small" color={theme.primary || '#22c55e'} />
          ) : (
            <Ionicons 
              name="time-outline" 
              size={24} 
              color={theme.primary || '#22c55e'} 
            />
          )}
        </TouchableOpacity>
        
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
       
               {/* Chat History Overlay */}
        {showChatHistory && (
          <View style={[
            styles.chatHistoryOverlay, 
            { 
              backgroundColor: theme.background,
              paddingTop: 0
            }
          ]}>
           <View style={styles.chatHistoryHeader}>
             <Text style={[styles.chatHistoryTitle, { color: theme.text }]}>
               Chat History
             </Text>
             <TouchableOpacity 
               onPress={() => setShowChatHistory(false)}
               style={styles.closeButton}
             >
               <Ionicons name="close" size={24} color={theme.text} />
             </TouchableOpacity>
           </View>
           
           {isLoadingHistory ? (
             <View style={styles.loadingContainer}>
               <ActivityIndicator size="large" color={theme.primary || '#22c55e'} />
               <Text style={[styles.loadingText, { color: theme.subtext }]}>
                 Loading chat history...
               </Text>
             </View>
           ) : chatHistory.length === 0 ? (
             <View style={styles.emptyContainer}>
               <Ionicons name="chatbubble-outline" size={48} color={theme.subtext} />
               <Text style={[styles.emptyText, { color: theme.subtext }]}>
                 No previous chats found
               </Text>
             </View>
           ) : (
                                                       <FlatList
                 data={chatHistory}
                 keyExtractor={(item) => item.session_id}
                                  renderItem={({ item }) => {
                    // Find the first user message in this chat session
                    const firstUserMessage = item.messages?.find(msg => msg.sender === "user");
                    const displayText = firstUserMessage?.message 
                      ? (firstUserMessage.message.length > 50 
                          ? firstUserMessage.message.substring(0, 50) + "..." 
                          : firstUserMessage.message)
                      : `Chat Session ${item.session_id}`;
                    
                    return (
                      <View style={[styles.chatHistoryItem, { borderBottomColor: theme.border }]}>
                        <TouchableOpacity
                          style={styles.chatHistoryItemContent}
                          onPress={() => loadChatSession(item.session_id)}
                        >
                          <View style={styles.chatHistoryItemTextContainer}>
                            <Text style={[styles.chatHistoryItemTitle, { color: theme.text }]}>
                              {displayText}
                            </Text>
                            <Text style={[styles.chatHistoryItemSubtitle, { color: theme.subtext }]}>
                              {item.messages?.length || 0} messages
                            </Text>
                          </View>
                          <Ionicons name="chevron-forward" size={20} color={theme.subtext} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteChat(item.session_id)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                 showsVerticalScrollIndicator={false}
               />
           )}
         </View>
       )}
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
             marginBottom: insets.bottom / 2,
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
    paddingVertical: 8,
    minHeight: 60,
  },
  chatHistoryButton: {
    padding: 5,
  },
  newChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 2,
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
  chatHistoryOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  chatHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chatHistoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
     chatHistoryItem: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     paddingHorizontal: 20,
     paddingVertical: 15,
     borderBottomWidth: 1,
   },
   chatHistoryItemContent: {
     flex: 1,
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
   },
   chatHistoryItemTextContainer: {
     flex: 1,
   },
   deleteButton: {
     padding: 8,
     marginLeft: 10,
   },
  chatHistoryItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  chatHistoryItemSubtitle: {
    fontSize: 14,
  },
});

export default ChatboxScreen;
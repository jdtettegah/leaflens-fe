import React, { useState, useContext, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { theme } = useContext(ThemeContext);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length, scrollToBottom]);

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
  const loadChatSession = async (sessionId) => {
    try {
      setIsLoadingHistory(true);
      const response = await apiService.getChatSession(sessionId);
      
             if (response.data?.success) {
         // Convert backend message format to frontend format
         let convertedMessages = response.data.messages.map((msg, index) => ({
           _id: msg.id ? `${msg.id}-${msg.sender}` : `${Date.now()}-${index}-${msg.sender}`,
           text: msg.message,
           createdAt: msg.timestamp ? new Date(msg.timestamp) : new Date(),
           user: {
             _id: msg.sender === 'user' ? 1 : 2,
             name: msg.sender === 'user' ? 'User' : 'PlantBot',
           },
         }));
         
         // Check if messages are in reverse chronological order (newest first)
         // If so, reverse them to get chronological order (oldest first) for inverted FlatList
         if (convertedMessages.length > 1) {
           const firstTime = convertedMessages[0].createdAt.getTime();
           const lastTime = convertedMessages[convertedMessages.length - 1].createdAt.getTime();
           if (firstTime > lastTime) {
             console.log('Messages are in reverse order, reversing...');
             convertedMessages = convertedMessages.reverse();
           }
         }
        
                 console.log('Loaded messages from API:', convertedMessages.map(msg => ({
           sender: msg.user.name,
           text: msg.text.substring(0, 30) + '...',
           timestamp: msg.createdAt.toISOString()
         })));
         
         console.log('Message order check:');
         console.log('First message:', convertedMessages[0]?.text?.substring(0, 20) + '...');
         console.log('Last message:', convertedMessages[convertedMessages.length - 1]?.text?.substring(0, 20) + '...');
        
        setMessages(convertedMessages);
        setSessionId(sessionId);
        setShowChatHistory(false);
      } else {
        Alert.alert('Error', response.data?.message || 'Failed to load chat session');
      }
    } catch (error) {
      console.error('Error loading chat session:', error);
      Alert.alert('Error', 'Failed to load chat session');
    } finally {
      setIsLoadingHistory(false);
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
  }, (prevProps, nextProps) => {
    // Custom comparison for better performance
    return prevProps.message._id === nextProps.message._id &&
           prevProps.message.text === nextProps.message.text;
  });

  const renderMessage = useCallback(({ item }) => <ChatMessage message={item} />, []);

  // Welcome screen with quick questions
  const renderWelcomeScreen = () => (
    <ScrollView 
      style={[styles.welcomeContainer, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.welcomeScrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <View style={[styles.header, { backgroundColor: theme.background }]}>
            <Image 
              source={require('../../assets/Images/lensAi.png')} 
              style={styles.lensAi} 
              resizeMode="contain"
            />
          </View>
          
          <View style={styles.welcomeContent}>
            <Text style={[styles.welcomeTitle, { color: theme.text }]}>
              How can I help with your plants today?
            </Text>
            <Text style={[styles.welcomeSubtitle, { color: theme.subtext }]}>
              Ask me anything about plant care, diseases, or gardening tips
            </Text>
          </View>
          
          <View style={styles.quickQuestionsContainer}>
            <Text style={[styles.quickQuestionsLabel, { color: theme.subtext }]}>
              Quick Questions
            </Text>
            {quickQuestions.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickQuestionButton, { backgroundColor: theme.card || '#f8fafc' }]}
                onPress={() => handleQuickQuestion(question)}
              >
                <Ionicons 
                  name="chatbubble-outline" 
                  size={16} 
                  color={theme.primary || '#22c55e'} 
                  style={styles.questionIcon}
                />
                <Text style={[styles.quickQuestionText, { color: theme.text }]}>
                  {question}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </ScrollView>
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
         contentContainerStyle={{ 
           paddingVertical: 20,
           paddingHorizontal: 5,
           flexGrow: 1,
           justifyContent: messages.length === 0 ? 'center' : 'flex-start'
         }}
         initialNumToRender={15}
         maxToRenderPerBatch={15}
         windowSize={10}
         removeClippedSubviews={true}
         keyboardDismissMode="interactive"
         showsVerticalScrollIndicator={false}
         scrollEventThrottle={16}
         decelerationRate="fast"
         bounces={true}
         overScrollMode="always"
         maintainVisibleContentPosition={{
           minIndexForVisible: 0,
           autoscrollToTopThreshold: 10
         }}
         onScrollToIndexFailed={() => {}}
         getItemLayout={(data, index) => ({
           length: 80, // Approximate height of each message
           offset: 80 * index,
           index,
         })}
         onScroll={(event) => {
           const offsetY = event.nativeEvent.contentOffset.y;
           setShowScrollButton(offsetY < -100);
         }}
       />
       
       {/* Scroll to bottom button */}
       {showScrollButton && messages.length > 5 && (
         <TouchableOpacity
           style={[styles.scrollButton, { backgroundColor: theme.primary || '#22c55e' }]}
           onPress={scrollToBottom}
         >
           <Ionicons name="chevron-down" size={20} color="#fff" />
         </TouchableOpacity>
       )}
       
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
             autoCorrect={true}
             spellCheck={true}
             textContentType="none"
             multiline
             editable={!isSending}
             onSubmitEditing={handleSendMessage}
             returnKeyType="send"
             blurOnSubmit={false}
             keyboardType="default"
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
     </TouchableWithoutFeedback>
   );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 40,
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
  },
  welcomeContent: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
  quickQuestionsContainer: {
    width: '100%',
    marginTop: 20,
  },
  quickQuestionsLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionIcon: {
    marginRight: 12,
  },
  quickQuestionText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
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
  scrollButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
});

export default ChatboxScreen;
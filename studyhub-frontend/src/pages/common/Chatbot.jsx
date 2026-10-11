import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Sparkles, 
  Plus, 
  History, 
  X, 
  Trash2, 
  Loader2, 
  Bot, 
  User, 
  Clock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import ChatMessage from '../../components/ai/ChatMessage';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(true);
  const [chatHistories, setChatHistories] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadChatHistories();
    startNewConversation();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistories = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.get('/ai/chat/histories');
      if (response.data && response.data.data) {
        setChatHistories(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load chat histories:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const startNewConversation = () => {
    setCurrentChatId(null);
    setMessages([
      {
        role: 'AI',
        content: 'Hello! I am your StudyHub AI academic assistant. Ask me anything about your syllabus, concepts, study notes, or exam preparation.'
      }
    ]);
  };

  const loadConversation = async (chatId) => {
    if (chatId === currentChatId) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/ai/chat/history/${chatId}`);
      if (response.data && response.data.data) {
        const history = response.data.data;
        setMessages(history.messages || []);
        setCurrentChatId(chatId);
      }
    } catch (error) {
      toast.error('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (chatId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      try {
        await api.delete(`/ai/chat/history/${chatId}`);
        setChatHistories(prev => prev.filter(h => h.id !== chatId));
        if (currentChatId === chatId) {
          startNewConversation();
        }
        toast.success('Conversation deleted');
      } catch (error) {
        toast.error('Failed to delete conversation');
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;
    if (loading || isStreaming) return;

    const userMessage = trimmedInput;
    setInput('');
    setIsStreaming(true);
    setLoading(true);

    try {
      setMessages(prev => [...prev, { role: 'USER', content: userMessage }]);
      setMessages(prev => [...prev, { role: 'AI', content: '', isStreaming: true }]);

      const response = await api.post('/ai/chat', { 
        message: userMessage,
        chatHistoryId: currentChatId 
      });

      if (response.data && response.data.success) {
        const aiResponse = typeof response.data.data === 'object' && response.data.data !== null
          ? response.data.data.response || JSON.stringify(response.data.data)
          : response.data.data;

        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (newMessages[lastIndex] && newMessages[lastIndex].role === 'AI') {
            newMessages[lastIndex].content = aiResponse || 'No response received.';
            newMessages[lastIndex].isStreaming = false;
          }
          return newMessages;
        });

        await loadChatHistories();
      } else {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          if (newMessages[lastIndex] && newMessages[lastIndex].role === 'AI') {
            newMessages[lastIndex].content = response.data?.message || 'Sorry, I encountered an issue. Please try again.';
            newMessages[lastIndex].isStreaming = false;
          }
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        if (newMessages[lastIndex] && newMessages[lastIndex].role === 'AI') {
          newMessages[lastIndex].content = error.response?.data?.message || 'Sorry, I\'m having trouble responding right now. Please try again.';
          newMessages[lastIndex].isStreaming = false;
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
      setIsStreaming(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const groupConversationsByDate = (conversations) => {
    const groups = {
      TODAY: [],
      YESTERDAY: [],
      OLDER: []
    };
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    conversations.forEach(conv => {
      const date = new Date(conv.updatedAt || conv.createdAt || Date.now());
      if (date >= today) {
        groups.TODAY.push(conv);
      } else if (date >= yesterday) {
        groups.YESTERDAY.push(conv);
      } else {
        groups.OLDER.push(conv);
      }
    });

    return groups;
  };

  const groupedHistories = groupConversationsByDate(chatHistories);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              AI Academic Assistant
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Ask questions, clarify topics, and summarize academic materials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startNewConversation}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
          
          <button
            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
          >
            <History className="w-3.5 h-3.5" />
            History ({chatHistories.length})
          </button>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex h-[620px]">
        {/* Left Sidebar: PAST SESSIONS */}
        <AnimatePresence>
          {showHistoryPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 260, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0 overflow-hidden"
            >
              {/* Sidebar Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 font-bold text-xs tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>PAST SESSIONS</span>
                </div>
                <button
                  onClick={() => setShowHistoryPanel(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sidebar List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
                {/* Fallback default sample items if no backend histories */}
                {chatHistories.length === 0 ? (
                  <>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1 px-2">
                        TODAY
                      </span>
                      <button 
                        onClick={() => setInput('explain mobile computing')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-200/60 truncate font-medium"
                      >
                        explain mobile computing
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1 px-2">
                        YESTERDAY
                      </span>
                      <button 
                        onClick={() => setInput('explain what is java')}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-200/60 truncate font-medium"
                      >
                        explain what is java
                      </button>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1 px-2">
                        OLDER
                      </span>
                      <div className="space-y-1">
                        <button 
                          onClick={() => setInput('Tips for exams')}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-200/60 truncate font-medium"
                        >
                          Tips for exams
                        </button>
                        <button 
                          onClick={() => setInput('hi')}
                          className="w-full text-left px-2.5 py-1.5 rounded-lg text-slate-700 hover:bg-slate-200/60 truncate font-medium"
                        >
                          hi
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  ['TODAY', 'YESTERDAY', 'OLDER'].map(group => {
                    const list = groupedHistories[group] || [];
                    if (list.length === 0) return null;
                    return (
                      <div key={group}>
                        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-1 px-2">
                          {group}
                        </span>
                        <div className="space-y-1">
                          {list.map(conv => (
                            <div
                              key={conv.id}
                              onClick={() => loadConversation(conv.id)}
                              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                                currentChatId === conv.id
                                  ? 'bg-blue-100/70 text-blue-700 font-semibold'
                                  : 'text-slate-700 hover:bg-slate-200/60 font-medium'
                              }`}
                            >
                              <span className="truncate flex-1">
                                {conv.title || 'Conversation'}
                              </span>
                              <button
                                onClick={(e) => deleteConversation(conv.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-red-500 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Chat Panel */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isUser={message.role === 'USER'}
              />
            ))}
            {loading && !isStreaming && (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                Generating response...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="border border-blue-200/80 rounded-2xl p-2 bg-white flex items-center gap-2 shadow-xs focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a concept, formula, algorithm, or syllabus topic..."
                className="flex-1 px-3 py-1.5 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                disabled={isStreaming}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading || isStreaming}
                className="p-2.5 bg-blue-100/70 hover:bg-blue-200 text-blue-600 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
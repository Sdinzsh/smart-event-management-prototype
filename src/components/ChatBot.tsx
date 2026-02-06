import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useEvents } from '../context/EventContext';
import { ChatMessage } from '../types';
import { format } from 'date-fns';

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your Smart Campus Events AI assistant. I can help you find events, answer questions about upcoming activities, and provide recommendations. How can I help you today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { events } = useEvents();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const getEventsContext = () => {
    const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');
    return upcomingEvents.map(e => 
      `- ${e.title} (${e.category}): ${format(new Date(e.date), 'MMM d, yyyy')} at ${e.time}, Venue: ${e.venue}. ${e.description.substring(0, 100)}...`
    ).join('\n');
  };

  const generateLocalResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const upcomingEvents = events.filter(e => e.status === 'upcoming' || e.status === 'ongoing');

    if (lowerMessage.includes('upcoming') || lowerMessage.includes('list') || lowerMessage.includes('what events')) {
      if (upcomingEvents.length === 0) {
        return "There are no upcoming events at the moment. Check back later for new events!";
      }
      const eventList = upcomingEvents.slice(0, 5).map(e => 
        `• **${e.title}** - ${format(new Date(e.date), 'MMM d, yyyy')} at ${e.venue}`
      ).join('\n');
      return `Here are the upcoming events:\n\n${eventList}\n\nWould you like more details about any of these events?`;
    }

    if (lowerMessage.includes('technical') || lowerMessage.includes('tech')) {
      const techEvents = upcomingEvents.filter(e => e.category === 'technical' || e.category === 'workshop');
      if (techEvents.length === 0) {
        return "There are no technical events scheduled at the moment. Would you like to know about other types of events?";
      }
      const eventList = techEvents.map(e => 
        `• **${e.title}** - ${format(new Date(e.date), 'MMM d, yyyy')}`
      ).join('\n');
      return `Here are the technical events:\n\n${eventList}`;
    }

    if (lowerMessage.includes('cultural') || lowerMessage.includes('fest')) {
      const culturalEvents = upcomingEvents.filter(e => e.category === 'cultural');
      if (culturalEvents.length === 0) {
        return "There are no cultural events scheduled at the moment.";
      }
      const eventList = culturalEvents.map(e => 
        `• **${e.title}** - ${format(new Date(e.date), 'MMM d, yyyy')}`
      ).join('\n');
      return `Here are the cultural events:\n\n${eventList}`;
    }

    if (lowerMessage.includes('sports') || lowerMessage.includes('tournament')) {
      const sportsEvents = upcomingEvents.filter(e => e.category === 'sports');
      if (sportsEvents.length === 0) {
        return "There are no sports events scheduled at the moment.";
      }
      const eventList = sportsEvents.map(e => 
        `• **${e.title}** - ${format(new Date(e.date), 'MMM d, yyyy')}`
      ).join('\n');
      return `Here are the sports events:\n\n${eventList}`;
    }

    if (lowerMessage.includes('workshop')) {
      const workshops = upcomingEvents.filter(e => e.category === 'workshop');
      if (workshops.length === 0) {
        return "There are no workshops scheduled at the moment.";
      }
      const eventList = workshops.map(e => 
        `• **${e.title}** - ${format(new Date(e.date), 'MMM d, yyyy')}`
      ).join('\n');
      return `Here are the upcoming workshops:\n\n${eventList}`;
    }

    if (lowerMessage.includes('register') || lowerMessage.includes('sign up') || lowerMessage.includes('join')) {
      return "To register for an event:\n1. Browse events from the 'Events' page\n2. Click on the event you're interested in\n3. Click the 'Register' button\n\nYou'll need to be logged in to register. Create an account if you don't have one!";
    }

    if (lowerMessage.includes('create') || lowerMessage.includes('organize') || lowerMessage.includes('host')) {
      return "To create an event:\n1. Sign up as an 'Organizer'\n2. Go to 'Create Event' from your dashboard\n3. Fill in the event details\n4. Submit and your event will be live!\n\nOnly organizers can create events.";
    }

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I can help you with:\n\n• **Finding events** - Ask about upcoming events, specific categories (tech, cultural, sports)\n• **Event details** - Get information about specific events\n• **Registration help** - Learn how to register for events\n• **Creating events** - Guide for organizers to create events\n• **Recommendations** - Get personalized event suggestions\n\nWhat would you like to know?";
    }

    if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest')) {
      if (upcomingEvents.length === 0) {
        return "There are no events to recommend at the moment. Check back later!";
      }
      const randomEvent = upcomingEvents[Math.floor(Math.random() * upcomingEvents.length)];
      return `I recommend checking out **${randomEvent.title}**!\n\n📅 ${format(new Date(randomEvent.date), 'MMMM d, yyyy')}\n📍 ${randomEvent.venue}\n\n${randomEvent.description.substring(0, 150)}...\n\nWould you like more recommendations?`;
    }

    return "I'm here to help you with campus events! You can ask me about:\n• Upcoming events\n• Specific event categories (tech, cultural, sports, workshops)\n• How to register for events\n• How to create events as an organizer\n\nWhat would you like to know?";
  };

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    if (!apiKey) {
      return generateLocalResponse(userMessage);
    }

    try {
      const eventsContext = getEventsContext();
      const systemPrompt = `You are a helpful AI assistant for a Smart Campus Event Management system. You help students and staff find events, register for events, and answer questions about campus activities.

Current upcoming events:
${eventsContext}

Be friendly, concise, and helpful. If asked about specific events, provide relevant details from the context above. If you don't know something, suggest checking the events page.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: systemPrompt },
                  { text: `User: ${userMessage}` }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            }
          })
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (aiResponse) {
        return aiResponse;
      }
      
      throw new Error('No response from API');
    } catch (error) {
      console.error('Gemini API error:', error);
      return generateLocalResponse(userMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await callGeminiAPI(input.trim());
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('gemini_api_key', apiKey);
    setShowApiKeyInput(false);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
      >
        <MessageCircle className="h-6 w-6" />
        <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Campus AI Assistant</h3>
                <p className="text-xs text-white/70">Powered by Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="text-white/70 hover:text-white p-1"
                title="Configure API Key"
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* API Key Input */}
          {showApiKeyInput && (
            <div className="p-3 bg-gray-50 border-b">
              <p className="text-xs text-gray-600 mb-2">Enter your Gemini API key for enhanced AI responses:</p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API Key (optional)"
                  className="flex-1 text-sm px-3 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={saveApiKey}
                  className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex items-start gap-2 max-w-[85%] ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`p-2 rounded-full ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-2xl rounded-tl-none">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about events..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

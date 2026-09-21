import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';
import { AnalysisResult, ChatMessage } from '../types';

interface AskAISectionProps {
  analysis: AnalysisResult;
}

const EXAMPLE_PROMPTS = [
  'Which changes are most important?',
  'Show me all price changes.',
  'Which changes could affect margin?',
  'Which changes could affect supply?',
  'What should the sales team discuss with the retailer?',
  'Summarise this for my CEO.',
];

export const AskAISection: React.FC<AskAISectionProps> = ({ analysis }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello. I am your commercial change advisor for this audit (${analysis.previousFileName} vs ${analysis.newFileName}). I can answer specific questions grounded strictly on the data and changes in these documents. What would you like to explore?`,
      timestamp: Date.now(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText || inputQuery).trim();
    if (!textToSend || isLoading) return;

    setErrorMsg(null);
    setInputQuery('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend,
          analysisData: analysis,
          conversationHistory: messages.slice(-8),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response from AI.');
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'No answer generated.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Ask AI Error:', err);
      setErrorMsg(err.message || 'An error occurred while contacting AI.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-blue-50/50 via-white to-pink-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-pink-600 text-white shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-display font-extrabold text-slate-900">
              Commercial AI Advisor
            </h3>
          </div>
          <span className="text-xs bg-pink-50 text-pink-700 font-bold px-2.5 py-0.5 rounded-full border border-pink-200">
            Strictly Grounded
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Ask queries answered strictly using the uploaded documents and detected changes. Never hallucinates outside sources.
        </p>
      </div>

      {/* Suggested Questions Chips */}
      <div className="px-5 py-3 bg-white border-b border-slate-100">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block mb-2">
          Suggested Queries:
        </span>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-pink-50/60 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-pink-300 transition-all text-left flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-pink-500 shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="p-5 space-y-4 max-h-[380px] min-h-[220px] overflow-y-auto bg-slate-50/40">
        {messages.map((msg) => {
          const isBot = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isBot ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                  isBot
                    ? 'bg-pink-100 text-pink-700'
                    : 'bg-blue-600 text-white'
                }`}
              >
                {isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-xs ${
                  isBot
                    ? 'bg-white border border-blue-100 text-slate-800'
                    : 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[10px] mt-1.5 ${
                    isBot ? 'text-slate-400' : 'text-blue-200'
                  }`}
                >
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-blue-100 rounded-2xl p-3.5 text-sm text-slate-600 flex items-center gap-2 shadow-xs">
              <RefreshCw className="w-4 h-4 animate-spin text-pink-600" />
              <span>Consulting commercial documents and database...</span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 rounded-xl bg-pink-50 border border-pink-200 text-xs text-pink-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-pink-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 bg-white border-t border-slate-200 flex items-center gap-2"
      >
        <input
          type="text"
          placeholder="Ask a commercial question about these changes..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder:text-slate-400 text-slate-800"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || isLoading}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-pink-500/20 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>
      </form>
    </div>
  );
};

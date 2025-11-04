import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { UserIcon, BotIcon, SendIcon, ExpandIcon, CollapseIcon } from './Icons';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExpandButton, setShowExpandButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      if (isExpanded) {
        textarea.style.height = '';
        setShowExpandButton(true); // Always show collapse button when expanded
      } else {
        // Auto-resize logic
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;

        // Show expand button only when content overflows the collapsed max-height
        // A small 2px buffer helps prevent flickering from rounding issues.
        setShowExpandButton(textarea.scrollHeight > textarea.clientHeight + 2);
      }
    }
  }, [input, isExpanded]);


  const submitMessage = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      if(isExpanded) setIsExpanded(false); // Collapse after sending if it was expanded
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col border border-gray-700/50">
      <h2 className="text-lg font-semibold text-cyan-300 mb-4 border-b border-cyan-700/50 pb-2">Conversation</h2>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && <div className="w-8 h-8 flex-shrink-0 bg-cyan-800 rounded-full flex items-center justify-center"><BotIcon /></div>}
            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-800/70' : 'bg-gray-700/70'}`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === 'user' && <div className="w-8 h-8 flex-shrink-0 bg-gray-600 rounded-full flex items-center justify-center"><UserIcon /></div>}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 flex-shrink-0 bg-cyan-800 rounded-full flex items-center justify-center"><BotIcon /></div>
            <div className="max-w-md p-3 rounded-lg bg-gray-700/70 flex items-center space-x-2">
              <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="mt-4 flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            className={`w-full bg-gray-700 border border-gray-600 rounded-lg py-2 pl-4 pr-12 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all duration-200 resize-none overflow-y-auto ${
              isExpanded ? 'h-72' : 'max-h-36'
            }`}
            placeholder="Describe your software..."
            disabled={isLoading}
          />
          {(showExpandButton || isExpanded) && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="absolute bottom-2 right-2 p-1.5 rounded-md hover:bg-gray-600/80 text-gray-400 transition"
              title={isExpanded ? 'Collapse' : 'Expand'}
              aria-label={isExpanded ? 'Collapse input' : 'Expand input'}
            >
              {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-full p-3 transition self-end"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
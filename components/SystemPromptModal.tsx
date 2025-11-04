import React, { useState, useEffect } from 'react';
import { CrossIcon } from './Icons';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPrompt: string;
  onSave: (newPrompt: string) => void;
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({ isOpen, onClose, currentPrompt, onSave }) => {
  const [prompt, setPrompt] = useState(currentPrompt);

  useEffect(() => {
    if (isOpen) {
      setPrompt(currentPrompt);
    }
  }, [isOpen, currentPrompt]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(prompt);
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-700/50 flex flex-col h-2/3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-cyan-300">Edit System Prompt</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400"
            aria-label="Close"
          >
            <CrossIcon />
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-gray-900 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition w-full flex-grow resize-none"
          placeholder="Enter the system prompt..."
        />
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500 text-white font-semibold transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemPromptModal;
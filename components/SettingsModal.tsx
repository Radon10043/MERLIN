import React, { useState } from 'react';
import { CrossIcon } from './Icons';
import { setupModel } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    // Functionality not required for this task.
    setupModel(baseUrl, apiKey);
    onClose();
  };

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity"
        onClick={onClose}
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700/50"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-cyan-300">Settings</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-gray-700 text-gray-400"
            aria-label="Close settings"
          >
            <CrossIcon />
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label htmlFor="apiKey" className="text-sm font-medium text-gray-400">API Key</label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
              placeholder="Enter your API Key"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label htmlFor="baseUrl" className="text-sm font-medium text-gray-400">Base URL</label>
            <input
              id="baseUrl"
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
              placeholder="e.g., https://api.openai.com/v1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
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

export default SettingsModal;
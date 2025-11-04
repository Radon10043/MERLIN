import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessage, MetamorphicRelation, MRStatus, UploadedCodeFile } from './types';
import { extractMetamorphicRelations, generateTestDriver } from './services/geminiService';
import ConfigurationPanel from './components/ConfigurationPanel';
import ChatWindow from './components/ChatWindow';
import MetamorphicRelationsList from './components/MetamorphicRelationsList';
import SettingsModal from './components/SettingsModal';
import SystemPromptModal from './components/SystemPromptModal';

function App() {
  const [modelName, setModelName] = useState<string>('gemini-2.5-flash');
  const [systemPrompt, setSystemPrompt] = useState<string>('You are MERLIN, an expert in software testing and metamorphic testing. Your goal is to help users identify metamorphic relations from their software descriptions.');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('Python');
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [metamorphicRelations, setMetamorphicRelations] = useState<MetamorphicRelation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [specificationFile, setSpecificationFile] = useState<UploadedCodeFile | null>(null);
  const [demoFile, setDemoFile] = useState<UploadedCodeFile | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);


  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem('merlin_messages');
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
      const savedMRs = localStorage.getItem('merlin_mrs');
      if (savedMRs) {
        setMetamorphicRelations(JSON.parse(savedMRs));
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);

  const saveMessages = useCallback((msgs: ChatMessage[]) => {
    try {
      localStorage.setItem('merlin_messages', JSON.stringify(msgs));
    } catch (e) {
      console.error("Failed to save messages to localStorage", e);
    }
  }, []);

  const saveMRs = useCallback((mrs: MetamorphicRelation[]) => {
    try {
      localStorage.setItem('merlin_mrs', JSON.stringify(mrs));
    } catch (e) {
      console.error("Failed to save MRs to localStorage", e);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      saveMessages(messages);
    }
  }, [messages, saveMessages]);

  useEffect(() => {
    saveMRs(metamorphicRelations);
  }, [metamorphicRelations, saveMRs]);


  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || isLoading) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setIsLoading(true);
    setError(null);
    
    // Construct the effective system prompt
    let effectiveSystemPrompt = systemPrompt;
    if (specificationFile) {
        effectiveSystemPrompt += `\n\nPlease identify the metamorphic relation of the program under test. Its specification is shown as follows:\n${specificationFile.content}`;
    }
    if (demoFile) {
        effectiveSystemPrompt += `\n\nPlease identify the metamorphic relation of the program as much as possible and codify them. Note that you should just output the code block. Here are some examples:\n${demoFile.content}`;
    }


    try {
      const extractedRel = await extractMetamorphicRelations(modelName, effectiveSystemPrompt, newMessages);
      
      let modelResponseContent: string;
      const newMRs: MetamorphicRelation[] = [];

      if (extractedRel && extractedRel.description) {
        modelResponseContent = "I've identified the following metamorphic relation and generated a test driver. Please review.";
        const driverInfo = await generateTestDriver(modelName, extractedRel.description, selectedLanguage);
        newMRs.push({
          id: `mr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          description: extractedRel.description,
          driver: driverInfo.driver,
          status: MRStatus.DECIDE_LATER,
          language: selectedLanguage,
        });
      } else {
        modelResponseContent = "I couldn't identify a new metamorphic relation based on your request. Could you please provide more details?";
      }

      const newModelMessage: ChatMessage = { role: 'model', content: modelResponseContent };
      setMessages(prev => [...prev, newModelMessage]);

      if (newMRs.length > 0) {
          setMetamorphicRelations(prev => [...prev, ...newMRs]);
      }

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to process your request: ${errorMessage}`);
      setMessages(prev => [...prev, { role: 'model', content: `Sorry, I encountered an error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateMRStatus = (id: string, status: MRStatus) => {
    setMetamorphicRelations(mrs =>
      mrs.map(mr => (mr.id === id ? { ...mr, status } : mr))
    );
  };

  const handleDeleteMR = (id: string) => {
    setMetamorphicRelations(mrs => mrs.filter(mr => mr.id !== id));
  };
  
  const clearChatHistory = () => {
    setMessages([]);
    localStorage.removeItem('merlin_messages');
  };

  const clearMRs = () => {
    setMetamorphicRelations([]);
    localStorage.removeItem('merlin_mrs');
  };

  const handleImportMRs = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("File could not be read as text.");
        }
        const data = JSON.parse(text);

        if (!Array.isArray(data) || (data.length > 0 && (typeof data[0].id === 'undefined' || typeof data[0].description === 'undefined'))) {
          throw new Error("Invalid file format. Expected an array of Metamorphic Relations.");
        }
        
        setMetamorphicRelations(data);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during import.';
        setError(`Failed to import MRs: ${errorMessage}`);
      }
    };
    reader.onerror = () => {
      setError("Failed to read the selected file.");
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  const handleSaveSystemPrompt = (newPrompt: string) => {
    setSystemPrompt(newPrompt);
    setIsPromptModalOpen(false);
  };

  return (
    <>
      <div className="flex h-screen font-sans bg-gray-900 text-gray-200">
        <ConfigurationPanel
          modelName={modelName}
          setModelName={setModelName}
          systemPrompt={systemPrompt}
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          specificationFile={specificationFile}
          setSpecificationFile={setSpecificationFile}
          demoFile={demoFile}
          setDemoFile={setDemoFile}
          clearChatHistory={clearChatHistory}
          clearMRs={clearMRs}
          metamorphicRelations={metamorphicRelations}
          onImportMRs={handleImportMRs}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenPromptModal={() => setIsPromptModalOpen(true)}
        />
        <main className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
          <h1 className="text-3xl font-bold text-cyan-400 text-center tracking-wider">MERLIN</h1>
          <p className="text-center text-gray-400 -mt-2 mb-2">Large Language Model Based Metamorphic Relation Identification</p>
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
            <MetamorphicRelationsList
              relations={metamorphicRelations}
              onUpdateStatus={handleUpdateMRStatus}
              onDelete={handleDeleteMR}
            />
          </div>
          {error && <div className="bg-red-800/50 text-red-200 p-3 rounded-md border border-red-700">{error}</div>}
        </main>
      </div>
      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
      <SystemPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        currentPrompt={systemPrompt}
        onSave={handleSaveSystemPrompt}
      />
    </>
  );
}

export default App;
import React, { useRef } from 'react';
import { DeleteIcon, UploadIcon, FileIcon, CrossIcon, ExportIcon, ImportIcon, SettingsIcon, EditIcon } from './Icons';
import { UploadedCodeFile, MetamorphicRelation } from '../types';

interface ConfigurationPanelProps {
  modelName: string;
  setModelName: (name: string) => void;
  systemPrompt: string;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  specificationFile: UploadedCodeFile | null;
  setSpecificationFile: (file: UploadedCodeFile | null) => void;
  demoFile: UploadedCodeFile | null;
  setDemoFile: (file: UploadedCodeFile | null) => void;
  clearChatHistory: () => void;
  clearMRs: () => void;
  metamorphicRelations: MetamorphicRelation[];
  onImportMRs: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenSettings: () => void;
  onOpenPromptModal: () => void;
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  modelName,
  setModelName,
  systemPrompt,
  selectedLanguage,
  setSelectedLanguage,
  specificationFile,
  setSpecificationFile,
  demoFile,
  setDemoFile,
  clearChatHistory,
  clearMRs,
  metamorphicRelations,
  onImportMRs,
  onOpenSettings,
  onOpenPromptModal,
}) => {
  const specFileInputRef = useRef<HTMLInputElement>(null);
  const demoFileInputRef = useRef<HTMLInputElement>(null);
  const importMRsInputRef = useRef<HTMLInputElement>(null);

  const handleSingleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    setter: (file: UploadedCodeFile | null) => void
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
        setter(null);
        return;
    };

    try {
        const content = await file.text();
        setter({ name: file.name, content });
    } catch (e) {
        console.error("Error reading file:", file.name, e);
        setter(null);
    }
    event.target.value = '';
  };
  
  const handleExport = () => {
    if (metamorphicRelations.length === 0) {
        alert("There are no Metamorphic Relations to export.");
        return;
    }
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(metamorphicRelations, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "merlin_mrs_export.json";
    link.click();
  };

  const SingleFileDisplay: React.FC<{
    file: UploadedCodeFile | null,
    onRemove: () => void
  }> = ({ file, onRemove }) => (
    <div className="bg-gray-800/50 p-2 rounded-md">
        <div className="flex items-center justify-between text-sm text-gray-300 bg-gray-700/50 p-1.5 rounded">
            <div className="flex items-center gap-2 truncate">
                <FileIcon/>
                <span className="truncate" title={file?.name}>{file?.name}</span>
            </div>
            <button onClick={onRemove} className="p-1 rounded-full hover:bg-red-800/50 text-red-400 flex-shrink-0"><CrossIcon /></button>
        </div>
    </div>
  );

  return (
    <aside className="w-80 bg-gray-950/50 p-4 flex flex-col space-y-6 border-r border-gray-700/50 overflow-y-auto">
      <div>
        <h2 className="text-xl font-semibold text-cyan-300 border-b border-cyan-700/50 pb-2 mb-6">Configuration</h2>
        <div className="space-y-4">
            <div className="flex flex-col space-y-2">
                <label htmlFor="modelName" className="text-sm font-medium text-gray-400">Model Name</label>
                <input
                id="modelName"
                type="text"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition"
                placeholder="e.g., gemini-2.5-flash"
                />
            </div>

            <div className="flex flex-col space-y-2">
                <label htmlFor="language" className="text-sm font-medium text-gray-400">Test Driver Language</label>
                <div className="relative">
                    <select
                        id="language"
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition appearance-none"
                    >
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                        <option value="C">C</option>
                        <option value="C++">C++</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-400">System Prompt</label>
                <div className="bg-gray-800 border border-gray-600 rounded-md p-2 text-sm text-gray-400 h-20 overflow-hidden relative">
                    <p className="whitespace-pre-wrap">{systemPrompt}</p>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent pointer-events-none"></div>
                </div>
                <button
                    onClick={onOpenPromptModal}
                    className="flex items-center justify-center gap-2 w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold py-2 px-3 rounded-md transition duration-200"
                >
                    <EditIcon />
                    View / Edit Prompt
                </button>
            </div>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col min-h-0 space-y-4 pt-4 border-t border-gray-700/50">
        <h3 className="text-lg font-semibold text-cyan-300">Context Augmentation</h3>
        
        {/* Specification Upload */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Specification</label>
            <input type="file" ref={specFileInputRef} onChange={(e) => handleSingleFileChange(e, setSpecificationFile)} className="hidden" />
            {!specificationFile ? (
                 <button onClick={() => specFileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full bg-cyan-800/50 hover:bg-cyan-700/50 text-cyan-200 font-semibold py-2 px-4 rounded-md transition duration-200">
                    <UploadIcon /> Upload Specification
                </button>
            ) : (
                <SingleFileDisplay file={specificationFile} onRemove={() => setSpecificationFile(null)} />
            )}
        </div>
        
        {/* Demo Upload */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Demo</label>
            <input type="file" ref={demoFileInputRef} onChange={(e) => handleSingleFileChange(e, setDemoFile)} className="hidden" />
            {!demoFile ? (
                 <button onClick={() => demoFileInputRef.current?.click()} className="flex items-center justify-center gap-2 w-full bg-cyan-800/50 hover:bg-cyan-700/50 text-cyan-200 font-semibold py-2 px-4 rounded-md transition duration-200">
                    <UploadIcon /> Upload Demo File
                </button>
            ) : (
                <SingleFileDisplay file={demoFile} onRemove={() => setDemoFile(null)} />
            )}
        </div>
      </div>

      <div className="flex flex-col space-y-2 pt-4 border-t border-gray-700/50 mt-auto">
        <h3 className="text-lg font-semibold text-cyan-300">Manage Data</h3>
        
        <input type="file" accept=".json" ref={importMRsInputRef} onChange={onImportMRs} className="hidden" />
        <button
            onClick={() => importMRsInputRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full bg-blue-800/50 hover:bg-blue-700/50 text-blue-200 font-semibold py-2 px-4 rounded-md transition duration-200"
        >
            <ImportIcon />
            Import MRs
        </button>

        <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 w-full bg-purple-800/50 hover:bg-purple-700/50 text-purple-200 font-semibold py-2 px-4 rounded-md transition duration-200"
        >
            <ExportIcon />
            Export MRs
        </button>
        
        <div className="pt-2 flex flex-col space-y-2">
            <button
                onClick={onOpenSettings}
                className="flex items-center justify-center gap-2 w-full bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 font-semibold py-2 px-4 rounded-md transition duration-200"
            >
                <SettingsIcon />
                Settings
            </button>
            <button
                onClick={clearChatHistory}
                className="flex items-center justify-center gap-2 w-full bg-red-800/50 hover:bg-red-700/50 text-red-200 font-semibold py-2 px-4 rounded-md transition duration-200"
            >
                <DeleteIcon />
                Clear Chat History
            </button>
            <button
                onClick={clearMRs}
                className="flex items-center justify-center gap-2 w-full bg-red-800/50 hover:bg-red-700/50 text-red-200 font-semibold py-2 px-4 rounded-md transition duration-200"
            >
                <DeleteIcon />
                Clear MRs
            </button>
        </div>
      </div>
    </aside>
  );
};

export default ConfigurationPanel;
import React, { useState } from 'react';
import { MetamorphicRelation, MRStatus } from '../types';
import { DeleteIcon, CheckIcon, CrossIcon, QuestionIcon, CopyIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

interface MetamorphicRelationCardProps {
  relation: MetamorphicRelation;
  onUpdateStatus: (id: string, status: MRStatus) => void;
  onDelete: (id: string) => void;
}

const statusConfig = {
  [MRStatus.VALID]: { color: 'green', Icon: CheckIcon },
  [MRStatus.INVALID]: { color: 'red', Icon: CrossIcon },
  [MRStatus.DECIDE_LATER]: { color: 'yellow', Icon: QuestionIcon },
};

const MetamorphicRelationCard: React.FC<MetamorphicRelationCardProps> = ({ relation, onUpdateStatus, onDelete }) => {
  const { color, Icon } = statusConfig[relation.status];
  const [isDriverExpanded, setIsDriverExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(relation.driver).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="bg-gray-900/70 border border-gray-700 rounded-lg p-4 space-y-4 transition hover:border-cyan-600/50">
      <div>
        <h3 className="font-semibold text-gray-300 mb-2">MR Description:</h3>
        <p className="text-gray-400 text-sm">{relation.description}</p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-300">Generated Test Driver ({relation.language || 'Python'}):</h3>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-cyan-300 bg-gray-700/80 hover:bg-gray-600/80 px-2 py-1 rounded-md transition"
                >
                    <CopyIcon />
                    {isCopied ? 'Copied!' : 'Copy'}
                </button>
                <button
                    onClick={() => setIsDriverExpanded(!isDriverExpanded)}
                    className="flex items-center gap-1 text-xs text-cyan-300 bg-gray-700/80 hover:bg-gray-600/80 px-2 py-1 rounded-md transition"
                >
                    {isDriverExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    {isDriverExpanded ? 'Show Less' : 'Show More'}
                </button>
            </div>
        </div>
        <pre className={`bg-black/50 p-3 rounded-md text-sm text-cyan-200 overflow-x-auto transition-all duration-300 whitespace-pre-wrap ${isDriverExpanded ? 'max-h-full' : 'max-h-24 overflow-hidden'}`}>
          <code>{relation.driver}</code>
        </pre>
      </div>

      <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-sm font-medium text-${color}-300 bg-${color}-800/50 px-2 py-1 rounded-full`}>
                <Icon/>
                {relation.status}
            </span>
        </div>

        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-400 mr-2">Judge Relation:</h4>
          <button onClick={() => onUpdateStatus(relation.id, MRStatus.VALID)} className="p-2 rounded-full hover:bg-green-800/50 text-green-400 transition" title="Valid"><CheckIcon /></button>
          <button onClick={() => onUpdateStatus(relation.id, MRStatus.INVALID)} className="p-2 rounded-full hover:bg-red-800/50 text-red-400 transition" title="Invalid"><CrossIcon /></button>
          <button onClick={() => onUpdateStatus(relation.id, MRStatus.DECIDE_LATER)} className="p-2 rounded-full hover:bg-yellow-800/50 text-yellow-400 transition" title="Decide Later"><QuestionIcon /></button>
          <div className="w-px h-6 bg-gray-600 mx-2"></div>
          <button onClick={() => onDelete(relation.id)} className="p-2 rounded-full hover:bg-red-800/50 text-red-300 transition" title="Delete"><DeleteIcon /></button>
        </div>
      </div>
    </div>
  );
};

export default MetamorphicRelationCard;
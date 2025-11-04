
import React, { useState, useMemo } from 'react';
import { MetamorphicRelation, MRStatus } from '../types';
import MetamorphicRelationCard from './MetamorphicRelationCard';

interface MetamorphicRelationsListProps {
  relations: MetamorphicRelation[];
  onUpdateStatus: (id: string, status: MRStatus) => void;
  onDelete: (id: string) => void;
}

const MetamorphicRelationsList: React.FC<MetamorphicRelationsListProps> = ({ relations, onUpdateStatus, onDelete }) => {
  const [filter, setFilter] = useState<MRStatus | 'All'>('All');
  
  const filteredRelations = useMemo(() => {
    if (filter === 'All') return relations;
    return relations.filter(r => r.status === filter);
  }, [relations, filter]);

  const filters: (MRStatus | 'All')[] = ['All', MRStatus.VALID, MRStatus.INVALID, MRStatus.DECIDE_LATER];

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col border border-gray-700/50">
      <h2 className="text-lg font-semibold text-cyan-300 mb-4 border-b border-cyan-700/50 pb-2">Metamorphic Relation Candidates</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm font-medium rounded-full transition ${
              filter === f 
                ? 'bg-cyan-600 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {filteredRelations.length > 0 ? (
          filteredRelations.map(relation => (
            <MetamorphicRelationCard
              key={relation.id}
              relation={relation}
              onUpdateStatus={onUpdateStatus}
              onDelete={onDelete}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 pt-10">
            <p>No metamorphic relations found.</p>
            <p className="text-sm">They will appear here after being identified.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetamorphicRelationsList;
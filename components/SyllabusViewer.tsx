import React, { useState, useMemo } from 'react';
import { syllabusData } from '../data/syllabusData';

interface SyllabusViewerProps {
  highlightedTopic?: string;
}

const SyllabusViewer: React.FC<SyllabusViewerProps> = ({ highlightedTopic }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    return syllabusData.filter(item => 
      item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="font-bold text-slate-800">Syllabus Explorer</h3>
        <p className="text-xs text-slate-500 mb-4">Browsing {syllabusData.length} syllabus reference entries</p>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search topics..."
            className="w-full bg-white border border-slate-200 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredData.length > 0 ? (
          filteredData.map(item => (
            <div 
              key={item.id} 
              className={`p-3 rounded-lg border transition-all ${
                highlightedTopic === item.topic 
                  ? 'border-indigo-500 bg-indigo-50 shadow-sm ring-1 ring-indigo-500' 
                  : 'border-slate-100 hover:border-slate-300 bg-white'
              }`}
            >
              <h4 className="font-semibold text-slate-800 text-sm mb-1">{item.topic}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.content}</p>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-10">
            <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No topics found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusViewer;

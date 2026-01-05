
import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import SyllabusViewer from './components/SyllabusViewer';

const App: React.FC = () => {
  const [highlightedTopic, setHighlightedTopic] = useState<string | undefined>();

  const handleSyllabusSearch = (topic: string) => {
    setHighlightedTopic(topic);
    // You could also add auto-scrolling to the topic here if needed
  };

  return (
    <div className="min-h-screen flex flex-col h-screen max-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 py-3 px-8 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-600 w-8 h-8 rounded flex items-center justify-center">
             <span className="text-white font-bold text-lg">A</span>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Academin Advisor</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-medium border border-green-200">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Cloud API Active
          </div>
          <button className="text-slate-500 hover:text-indigo-600 p-2 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden p-4 md:p-6 gap-6">
        {/* Left Side: Chat (Major) */}
        <div className="flex-1 min-w-0">
          <ChatInterface onSyllabusSearch={handleSyllabusSearch} />
        </div>

        {/* Right Side: Syllabus (Minor) */}
        <div className="hidden lg:block w-96 flex-shrink-0">
          <SyllabusViewer highlightedTopic={highlightedTopic} />
        </div>
      </main>
      
      {/* Mobile Footer Toggle or similar if needed */}
      <div className="lg:hidden p-4 pt-0">
        <div className="bg-white rounded-lg border border-slate-200 p-3 text-center text-xs text-slate-500 shadow-sm">
           Syllabus Explorer available on larger screens.
        </div>
      </div>
    </div>
  );
};

export default App;
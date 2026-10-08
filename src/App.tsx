import React, { useState, useEffect } from 'react';
import { ActiveTab, InsertPage, SpeechAnalysisReport } from './types';
import { PRESET_INSERT_PAGES } from './data/presetPages';
import { Navbar } from './components/Navbar';
import { InsertPageModal } from './components/InsertPageModal';
import { TeleprompterStudio } from './screens/TeleprompterStudio';
import { InsertPagesLibrary } from './screens/InsertPagesLibrary';
import { TextToSpeechStudio } from './screens/TextToSpeechStudio';
import { VoiceConversationStudio } from './screens/VoiceConversationStudio';
import { AnalyticsDashboard } from './screens/AnalyticsDashboard';
import { RecordingsHistory } from './screens/RecordingsHistory';

const LOCAL_STORAGE_PAGES_KEY = 'luminescent_cadence_pages_v1';
const LOCAL_STORAGE_HISTORY_KEY = 'luminescent_cadence_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('prompter');

  // Insert Pages State
  const [insertPages, setInsertPages] = useState<InsertPage[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_PAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return PRESET_INSERT_PAGES;
  });

  const [currentPage, setCurrentPage] = useState<InsertPage>(() => {
    return insertPages[0] || PRESET_INSERT_PAGES[0];
  });

  // History & Diagnostics Reports State
  const [historyReports, setHistoryReports] = useState<SpeechAnalysisReport[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [latestReport, setLatestReport] = useState<SpeechAnalysisReport | null>(null);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);

  // Persist pages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PAGES_KEY, JSON.stringify(insertPages));
    } catch {}
  }, [insertPages]);

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(historyReports));
    } catch {}
  }, [historyReports]);

  // Handle saving new Insert Page
  const handleSaveInsertPage = (newPage: InsertPage, autoLoadPrompter = false) => {
    setInsertPages((prev) => [newPage, ...prev]);
    setCurrentPage(newPage);
    if (autoLoadPrompter) {
      setActiveTab('prompter');
    }
  };

  // Handle deleting custom insert page
  const handleDeleteCustomPage = (id: string) => {
    setInsertPages((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (currentPage.id === id && updated.length > 0) {
        setCurrentPage(updated[0]);
      }
      return updated;
    });
  };

  // Handle speech analysis completion from Teleprompter
  const handleAnalysisComplete = (report: SpeechAnalysisReport) => {
    setLatestReport(report);
    setHistoryReports((prev) => [report, ...prev]);
    setActiveTab('analytics');
  };

  // Switch to TTS studio with chosen page
  const handleListenTTS = (page: InsertPage) => {
    setCurrentPage(page);
    setActiveTab('tts');
  };

  // Switch to Voice Sparring with chosen page
  const handleStartVoiceSparring = (page: InsertPage) => {
    setCurrentPage(page);
    setActiveTab('conversation');
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#131B2E] flex flex-col font-sans selection:bg-[#C3C0FF] selection:text-[#0F0069]">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenInsertModal={() => setIsInsertModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'prompter' && (
          <TeleprompterStudio
            currentPage={currentPage}
            allPages={insertPages}
            onSelectPage={(page) => setCurrentPage(page)}
            onOpenInsertModal={() => setIsInsertModalOpen(true)}
            onAnalysisComplete={handleAnalysisComplete}
            onListenTTS={handleListenTTS}
          />
        )}

        {activeTab === 'inserts' && (
          <InsertPagesLibrary
            insertPages={insertPages}
            onSelectPage={(page, navigateToPrompter) => {
              setCurrentPage(page);
              if (navigateToPrompter) setActiveTab('prompter');
            }}
            onOpenInsertModal={() => setIsInsertModalOpen(true)}
            onListenTTS={handleListenTTS}
            onStartVoiceSparring={handleStartVoiceSparring}
            onDeleteCustomPage={handleDeleteCustomPage}
          />
        )}

        {activeTab === 'tts' && (
          <TextToSpeechStudio
            insertPages={insertPages}
            initialPage={currentPage}
          />
        )}

        {activeTab === 'conversation' && (
          <VoiceConversationStudio
            currentInsertPage={currentPage}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            report={latestReport}
            onPracticeAgain={() => setActiveTab('prompter')}
            onOpenInsertPages={() => setActiveTab('inserts')}
          />
        )}

        {activeTab === 'history' && (
          <RecordingsHistory
            historyReports={historyReports}
            onSelectReport={(report) => {
              setLatestReport(report);
              setActiveTab('analytics');
            }}
            onClearHistory={() => setHistoryReports([])}
            onNewSession={() => setActiveTab('prompter')}
          />
        )}
      </main>

      {/* Insert Page Modal */}
      <InsertPageModal
        isOpen={isInsertModalOpen}
        onClose={() => setIsInsertModalOpen(false)}
        onSavePage={handleSaveInsertPage}
      />

      {/* Bottom Footer */}
      <footer className="border-t border-[#E2E8F0] bg-white py-6 mt-12 text-center text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A] font-display">Luminescent Cadence</span>
            <span>•</span>
            <span>AI Voice & Speech Intelligence Studio</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Optimal Cadence: 130–160 WPM</span>
            <span>•</span>
            <span>Powered by Google Gemini 3.8</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import {
  Mic,
  FileText,
  MessageSquare,
  Volume2,
  BarChart3,
  History,
  Sparkles,
  Plus,
  Radio,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenInsertModal: () => void;
  isRecording?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenInsertModal,
  isRecording = false,
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }> = [
    {
      id: 'prompter',
      label: 'Teleprompter',
      icon: <Radio className="w-4 h-4" />,
      badge: isRecording ? 'REC' : undefined,
    },
    {
      id: 'inserts',
      label: 'Insert Pages',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'conversation',
      label: 'Voice Sparring',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: 'Live AI',
    },
    {
      id: 'tts',
      label: 'Text to Speech',
      icon: <Volume2 className="w-4 h-4" />,
    },
    {
      id: 'analytics',
      label: 'Diagnostics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: 'Sessions',
      icon: <History className="w-4 h-4" />,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('prompter')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3525CD] to-[#8455EF] flex items-center justify-center text-white shadow-md shadow-[#4F46E5]/20 group-hover:scale-105 transition-transform">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[#0F172A] tracking-tight text-lg font-display">
                    Luminescent
                  </span>
                  <span className="font-light text-[#4F46E5] text-lg font-display">
                    Cadence
                  </span>
                </div>
                <div className="text-[11px] font-medium text-[#64748B] tracking-wide flex items-center gap-1">
                  <span>Elite Vocal Mentor</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[#10B981] font-semibold flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] inline-block animate-pulse" />
                    Gemini 3.8
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F8FAFC] p-1 rounded-full border border-[#E2E8F0]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all relative ${
                    isActive
                      ? 'bg-white text-[#4F46E5] shadow-[0_2px_4px_rgba(79,70,229,0.12)] border border-[#4F46E5]/20 font-bold'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-white/60'
                  }`}
                >
                  <span className={isActive ? 'text-[#4F46E5]' : 'text-[#64748B]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                        item.badge === 'REC'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-[#EDE9FE] text-[#6D28D9]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Action Button: Insert Page */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenInsertModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#4F46E5] to-[#6366F1] hover:from-[#4338CA] hover:to-[#4F46E5] shadow-[0_2px_6px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_12px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E0E7FF]" />
              <Plus className="w-3.5 h-3.5" />
              <span>Insert Page</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#4F46E5] text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[8px] px-1 py-0.2 rounded-full bg-white/20 text-white font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

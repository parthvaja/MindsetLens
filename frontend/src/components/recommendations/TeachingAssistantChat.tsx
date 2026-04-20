'use client';

import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { chatWithAssistant } from '@/lib/api/analytics';
import { Sparkles, SendHorizonal, X } from 'lucide-react';

interface Message {
  role: 'teacher' | 'assistant';
  content: string;
}

interface TeachingAssistantChatProps {
  studentId: string;
  studentName: string;
}

const QUICK_PROMPTS = [
  { label: 'Build report', message: 'How do I build a better report with this student?' },
  { label: 'Handle frustration', message: 'What do I say when this student gets frustrated?' },
  { label: 'Best praise style', message: 'What kind of praise works best for this student?' },
  { label: 'Challenge approach', message: 'How should I present challenging tasks to this student?' },
];

export default function TeachingAssistantChat({
  studentId,
  studentName,
}: TeachingAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (vars: { message: string; topic?: string }) =>
      chatWithAssistant({ student_id: studentId, ...vars }),
    onSuccess: (data, vars) => {
      setMessages((prev) => [
        ...prev,
        { role: 'teacher', content: vars.message },
        { role: 'assistant', content: data.response },
      ]);
      setInput('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    },
  });

  const send = (overrideMessage?: string) => {
    const msg = overrideMessage ?? input.trim();
    if (!msg) return;
    mutation.mutate({ message: msg });
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/25 flex items-center justify-center">
            <Sparkles size={11} className="text-violet-400" />
          </div>
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">
            AI Teaching Assistant
          </span>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] flex items-center gap-1 transition-colors"
          >
            <X size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => send(p.message)}
              disabled={mutation.isPending}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20 hover:bg-violet-500/20 transition-all disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'teacher' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  m.role === 'teacher'
                    ? 'bg-indigo-600 text-white rounded-br-sm shadow-[0_4px_12px_rgba(99,102,241,0.3)]'
                    : 'bg-[var(--surface-3)] text-[var(--text-secondary)] border border-[var(--border)] rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-[var(--surface-3)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={`Ask anything about ${studentName}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={mutation.isPending}
          className="flex-1 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] px-3 py-2.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/15 outline-none transition-all disabled:opacity-50"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || mutation.isPending}
          className="shrink-0 p-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_8px_rgba(99,102,241,0.3)]"
        >
          <SendHorizonal size={14} />
        </button>
      </div>
    </div>
  );
}

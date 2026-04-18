'use client';

import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { chatWithAssistant } from '@/lib/api/analytics';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface Message {
  role: 'teacher' | 'assistant';
  content: string;
}

interface TeachingAssistantChatProps {
  studentId: string;
  studentName: string;
}

const QUICK_PROMPTS = [
  { label: 'Topic examples', message: 'Give me examples for teaching this topic', needsTopic: true },
  { label: 'Build rapport', message: 'How do I build rapport with this student?' },
  { label: 'Handle frustration', message: 'What do I say when this student gets frustrated and wants to quit?' },
  { label: 'Praise that works', message: 'What kind of praise works best for this student?' },
];

export default function TeachingAssistantChat({
  studentId,
  studentName,
}: TeachingAssistantChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [topic, setTopic] = useState('');
  const [showTopicInput, setShowTopicInput] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const mutation = useMutation({
    mutationFn: (vars: { message: string; topic?: string }) =>
      chatWithAssistant({ student_id: studentId, ...vars }),
    onSuccess: (data, vars) => {
      setMessages((prev) => [
        ...prev,
        { role: 'teacher', content: vars.topic ? `${vars.message} (topic: ${vars.topic})` : vars.message },
        { role: 'assistant', content: data.response },
      ]);
      setInput('');
      setTopic('');
      setShowTopicInput(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    },
  });

  const send = (overrideMessage?: string, overrideTopic?: string) => {
    const msg = overrideMessage ?? input.trim();
    const tpc = overrideTopic ?? (showTopicInput ? topic.trim() : undefined);
    if (!msg) return;
    mutation.mutate({ message: msg, topic: tpc || undefined });
  };

  const sendQuick = (prompt: typeof QUICK_PROMPTS[0]) => {
    if (prompt.needsTopic) {
      setInput(prompt.message);
      setShowTopicInput(true);
    } else {
      mutation.mutate({ message: prompt.message });
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="h-4 w-4 text-violet-500" />
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Teaching Assistant
        </span>
      </div>

      {/* Quick prompts */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => sendQuick(p)}
              disabled={mutation.isPending}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Conversation */}
      {messages.length > 0 && (
        <div className="space-y-3 mb-4 max-h-72 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'teacher' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'teacher'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {mutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Topic input (shown for prompts that need it) */}
      {showTopicInput && (
        <div className="mb-2">
          <input
            type="text"
            placeholder="Enter topic (e.g. fractions, photosynthesis, soccer…)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            className="w-full rounded-lg border border-violet-300 px-3 py-2 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none"
            autoFocus
          />
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
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none disabled:opacity-50"
        />
        <button
          onClick={() => send()}
          disabled={(!input.trim() && !showTopicInput) || mutation.isPending}
          className="flex-shrink-0 p-2.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <PaperAirplaneIcon className="h-4 w-4" />
        </button>
      </div>

      {messages.length > 0 && (
        <button
          onClick={() => setMessages([])}
          className="mt-2 text-xs text-gray-400 hover:text-gray-600 text-right self-end"
        >
          Clear chat
        </button>
      )}
    </div>
  );
}

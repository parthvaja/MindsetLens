'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SURVEY_QUESTIONS } from '@/lib/utils/constants';
import { SurveyResult, SurveyResponseItem } from '@/types/survey.types';
import { submitSurvey } from '@/lib/api/surveys';
import LikertScale from './LikertScale';
import toast from 'react-hot-toast';
import { MessageSquare, ListChecks, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SurveyFormProps {
  studentId: string;
  studentName: string;
  onComplete: (result: SurveyResult) => void;
}

export default function SurveyForm({ studentId, studentName, onComplete }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const currentQuestion = SURVEY_QUESTIONS[currentStep];
  const currentAnswer = answers[currentQuestion.id];
  const progress = ((currentStep + 1) / SURVEY_QUESTIONS.length) * 100;
  const isLastStep = currentStep === SURVEY_QUESTIONS.length - 1;

  const canProceed = (): boolean => {
    if (currentQuestion.type === 'likert') return typeof currentAnswer === 'number';
    return typeof currentAnswer === 'string' && currentAnswer.trim().length >= 20;
  };

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else {
      setDirection('forward');
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setDirection('back');
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const responses: SurveyResponseItem[] = SURVEY_QUESTIONS.map((q) => {
        if (q.type === 'likert') {
          return { question_id: q.id, question_text: q.text, answer_value: answers[q.id] as number };
        }
        return { question_id: q.id, question_text: q.text, answer_text: (answers[q.id] as string) || '' };
      });

      const result = await submitSurvey(studentId, { survey_type: 'initial', responses });
      toast.success('Survey submitted!');
      onComplete(result);
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const slideVariants = {
    enter: (dir: string) => ({
      x: dir === 'forward' ? 32 : -32,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: string) => ({
      x: dir === 'forward' ? -32 : 32,
      opacity: 0,
    }),
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">
              Mindset Assessment
            </p>
            <h1 className="text-xl font-heading font-semibold text-zinc-100 tracking-tight">
              Survey for{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-sky-400 bg-clip-text text-transparent">
                {studentName}
              </span>
            </h1>
          </div>
          <div className="text-right">
            <span className="text-xs text-zinc-500">Question</span>
            <p className="text-lg font-bold text-zinc-200 tabular-nums">
              {currentStep + 1}<span className="text-zinc-600 text-sm font-normal">/{SURVEY_QUESTIONS.length}</span>
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-sky-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Step dots */}
        <div className="flex gap-1 mt-2">
          {SURVEY_QUESTIONS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-0.5 flex-1 rounded-full transition-all duration-300',
                i < currentStep ? 'bg-cyan-500' : i === currentStep ? 'bg-cyan-400' : 'bg-zinc-800'
              )}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-zinc-900 rounded-2xl border border-zinc-800 p-7 mb-6 shadow-[0_4px_40px_rgba(0,0,0,0.4)]"
          >
            {/* Type badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className={cn(
                'inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border',
                currentQuestion.type === 'likert'
                  ? 'bg-cyan-500/8 text-cyan-400 border-cyan-500/20'
                  : 'bg-violet-500/8 text-violet-400 border-violet-500/20'
              )}>
                {currentQuestion.type === 'likert' ? (
                  <><ListChecks size={10} />Multiple Choice</>
                ) : (
                  <><MessageSquare size={10} />Open Response</>
                )}
              </span>
            </div>

            <h2 className="text-base font-medium text-zinc-100 leading-relaxed mb-6">
              {currentQuestion.text}
            </h2>

            {currentQuestion.type === 'likert' ? (
              <LikertScale
                questionId={currentQuestion.id}
                value={currentAnswer as number | undefined}
                onChange={(v) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: v }))}
              />
            ) : (
              <div>
                <textarea
                  value={(currentAnswer as string) || ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  maxLength={currentQuestion.maxLength}
                  rows={5}
                  placeholder="Type your response here... (min. 20 characters)"
                  className="w-full px-4 py-3.5 bg-zinc-800/60 border border-zinc-700 rounded-xl text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none resize-none transition-all"
                />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-zinc-600">
                    {typeof currentAnswer === 'string' && currentAnswer.trim().length < 20 && currentAnswer.length > 0 && (
                      <span className="text-amber-400">{20 - currentAnswer.trim().length} more characters needed</span>
                    )}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {typeof currentAnswer === 'string' ? currentAnswer.length : 0} / {currentQuestion.maxLength}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleBack}
          disabled={currentStep === 0 || isSubmitting}
          className="flex items-center gap-2 h-10 px-4 rounded-xl border border-zinc-800 text-sm font-medium text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 hover:border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft size={14} />
          Back
        </button>

        <button
          onClick={handleNext}
          disabled={!canProceed() || isSubmitting}
          className="flex items-center gap-2 h-10 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_2px_8px_rgba(6,182,212,0.3)] hover:shadow-[0_4px_16px_rgba(6,182,212,0.4)] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <><Loader2 size={14} className="animate-spin" />Submitting…</>
          ) : isLastStep ? (
            <>Submit Survey <ArrowRight size={14} /></>
          ) : (
            <>Next <ArrowRight size={14} /></>
          )}
        </button>
      </div>
    </div>
  );
}

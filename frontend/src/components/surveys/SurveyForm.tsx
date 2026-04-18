'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SURVEY_QUESTIONS } from '@/lib/utils/constants';
import { SurveyResult, SurveyResponseItem } from '@/types/survey.types';
import { submitSurvey } from '@/lib/api/surveys';
import LikertScale from './LikertScale';
import ProgressIndicator from '@/components/ui/progress-indicator';
import toast from 'react-hot-toast';
import { MessageSquare, ListChecks } from 'lucide-react';

interface SurveyFormProps {
  studentId: string;
  studentName: string;
  onComplete: (result: SurveyResult) => void;
}

// Group 12 questions into 3 sections of 4
const SECTION_SIZE = 4;
const TOTAL_SECTIONS = Math.ceil(SURVEY_QUESTIONS.length / SECTION_SIZE);

export default function SurveyForm({
  studentId,
  studentName,
  onComplete,
}: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = SURVEY_QUESTIONS[currentStep];
  const currentAnswer = answers[currentQuestion.id];
  const currentSection = Math.floor(currentStep / SECTION_SIZE) + 1;

  const canProceed = (): boolean => {
    if (currentQuestion.type === 'likert') {
      return typeof currentAnswer === 'number';
    }
    return typeof currentAnswer === 'string' && currentAnswer.trim().length >= 20;
  };

  const handleNext = () => {
    if (currentStep < SURVEY_QUESTIONS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const isLastStep = currentStep === SURVEY_QUESTIONS.length - 1;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const responses: SurveyResponseItem[] = SURVEY_QUESTIONS.map((q) => {
        if (q.type === 'likert') {
          return {
            question_id: q.id,
            question_text: q.text,
            answer_value: answers[q.id] as number,
          };
        }
        return {
          question_id: q.id,
          question_text: q.text,
          answer_text: (answers[q.id] as string) || '',
        };
      });

      const result = await submitSurvey(studentId, {
        survey_type: 'initial',
        responses,
      });

      toast.success('Survey submitted!');
      onComplete(result);
    } catch {
      toast.error('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest mb-1">
          Mindset Survey
        </p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Assessment for{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            {studentName}
          </span>
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Question {currentStep + 1} of {SURVEY_QUESTIONS.length}
        </p>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] p-7 mb-8 shadow-[0_4px_40px_rgba(0,0,0,0.3)]"
        >
          {/* Question type badge */}
          <div className="flex items-center gap-2 mb-5">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {currentQuestion.type === 'likert' ? (
                <>
                  <ListChecks size={10} />
                  Multiple Choice
                </>
              ) : (
                <>
                  <MessageSquare size={10} />
                  Open Response
                </>
              )}
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              Section {currentSection} of {TOTAL_SECTIONS}
            </span>
          </div>

          <h2 className="text-base font-semibold text-[var(--text-primary)] leading-relaxed mb-6">
            {currentQuestion.text}
          </h2>

          {currentQuestion.type === 'likert' ? (
            <LikertScale
              questionId={currentQuestion.id}
              value={currentAnswer as number | undefined}
              onChange={(v) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: v }))
              }
            />
          ) : (
            <div>
              <textarea
                value={(currentAnswer as string) || ''}
                onChange={(e) =>
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.id]: e.target.value,
                  }))
                }
                maxLength={currentQuestion.maxLength}
                rows={5}
                placeholder="Type your response here..."
                className="w-full px-4 py-3 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none resize-none transition-all"
              />
              <div className="flex justify-between mt-2">
                <p className="text-xs text-[var(--text-muted)]">
                  {typeof currentAnswer === 'string' &&
                    currentAnswer.trim().length < 20 &&
                    currentAnswer.length > 0 && (
                      <span className="text-amber-400">
                        {20 - currentAnswer.trim().length} more characters needed
                      </span>
                    )}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {typeof currentAnswer === 'string' ? currentAnswer.length : 0} /{' '}
                  {currentQuestion.maxLength}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Progress indicator */}
      <ProgressIndicator
        step={currentSection}
        totalSteps={TOTAL_SECTIONS}
        onContinue={handleNext}
        onBack={handleBack}
        disabled={!canProceed()}
        loading={isSubmitting && isLastStep}
      />
    </div>
  );
}

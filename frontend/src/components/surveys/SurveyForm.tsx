'use client';

import { useState } from 'react';
import { SURVEY_QUESTIONS } from '@/lib/utils/constants';
import { SurveyResult, SurveyResponseItem } from '@/types/survey.types';
import { submitSurvey } from '@/lib/api/surveys';
import LikertScale from './LikertScale';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface SurveyFormProps {
  studentId: string;
  studentName: string;
  onComplete: (result: SurveyResult) => void;
}

export default function SurveyForm({ studentId, studentName, onComplete }: SurveyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = SURVEY_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / SURVEY_QUESTIONS.length) * 100;
  const currentAnswer = answers[currentQuestion.id];

  const canProceed = (): boolean => {
    if (currentQuestion.type === 'likert') {
      return typeof currentAnswer === 'number';
    }
    // text — minimum 20 chars
    return typeof currentAnswer === 'string' && currentAnswer.trim().length >= 20;
  };

  const handleNext = () => {
    if (currentStep < SURVEY_QUESTIONS.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

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
    <div className="max-w-3xl mx-auto">
      {/* Header + Progress */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Mindset Survey
        </h1>
        <p className="text-gray-500 mb-4">For {studentName}</p>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {currentStep + 1} / {SURVEY_QUESTIONS.length}
          </span>
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
            {currentQuestion.type === 'likert' ? 'Multiple Choice' : 'Open Response'}
          </span>
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-6 leading-relaxed">
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
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))
              }
              maxLength={currentQuestion.maxLength}
              rows={6}
              placeholder="Type your response here..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none resize-none"
            />
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-400">
                {typeof currentAnswer === 'string' && currentAnswer.trim().length < 20 && currentAnswer.length > 0 && (
                  <span className="text-amber-500">
                    {20 - currentAnswer.trim().length} more characters needed
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-400">
                {typeof currentAnswer === 'string' ? currentAnswer.length : 0} / {currentQuestion.maxLength}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => setCurrentStep((s) => s - 1)}
          disabled={currentStep === 0}
        >
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed()}
          loading={isSubmitting}
        >
          {currentStep === SURVEY_QUESTIONS.length - 1 ? 'Submit Survey' : 'Next Question'}
        </Button>
      </div>
    </div>
  );
}

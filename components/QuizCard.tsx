import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, BookOpen, HelpCircle } from 'lucide-react';

interface QuizCardProps {
  question: Question;
  onAnswer: (answer: string) => void;
  onNext: () => void;
  isLastQuestion: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({ question, onAnswer, onNext, isLastQuestion }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (option: string) => {
    if (isSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setIsSubmitted(true);
    onAnswer(selectedOption);
  };

  const isCorrect = selectedOption === question.correctAnswer;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden mb-6">
        <div className="bg-indigo-50 px-6 py-3 border-b border-indigo-100 flex items-center gap-2">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-md">
            {question.usageType}
          </span>
          <span className="text-xs text-slate-500">중3 필수 문법</span>
        </div>
        
        <div className="p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-2 leading-relaxed">
            {question.text}
          </h2>
          <p className="text-sm text-slate-500 mb-6 flex items-center gap-1">
            <BookOpen size={14} />
            {question.koreanTranslation}
          </p>

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              let baseClass = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex justify-between items-center group ";
              
              if (isSubmitted) {
                if (option === question.correctAnswer) {
                  baseClass += "border-green-500 bg-green-50 text-green-800";
                } else if (option === selectedOption) {
                  baseClass += "border-red-400 bg-red-50 text-red-800";
                } else {
                  baseClass += "border-slate-100 opacity-50";
                }
              } else {
                if (option === selectedOption) {
                  baseClass += "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-md";
                } else {
                  baseClass += "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(option)}
                  className={baseClass}
                  disabled={isSubmitted}
                >
                  <span className="font-medium text-lg">{option}</span>
                  {isSubmitted && option === question.correctAnswer && <CheckCircle className="text-green-600" size={20}/>}
                  {isSubmitted && option === selectedOption && option !== question.correctAnswer && <XCircle className="text-red-500" size={20}/>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Explanation Section */}
        {isSubmitted && (
          <div className={`p-6 border-t ${isCorrect ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'} animate-fade-in`}>
            <div className="flex items-start gap-3">
              <div className={`mt-1 p-2 rounded-full ${isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                <HelpCircle size={20} />
              </div>
              <div>
                <h3 className={`font-bold mb-1 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                  {isCorrect ? '정답입니다!' : '아쉽네요!'}
                </h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {question.explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            정답 확인하기
          </button>
        ) : (
          <button
            onClick={() => {
              setSelectedOption(null);
              setIsSubmitted(false);
              onNext();
            }}
            className="w-full py-4 bg-slate-800 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
          >
            {isLastQuestion ? '결과 보기' : '다음 문제'}
          </button>
        )}
      </div>
    </div>
  );
};
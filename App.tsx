import React, { useState, useCallback } from 'react';
import { GraduationCap, Brain, Trophy, RefreshCcw, AlertCircle } from 'lucide-react';
import { AppState, Question, QuizState, UsageType } from './types';
import { generateQuestions } from './services/geminiService';
import { Button } from './components/Button';
import { QuizCard } from './components/QuizCard';
import { ProgressBar } from './components/ProgressBar';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.START);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    answers: {},
    isCorrect: {}
  });
  const [loadingMessage, setLoadingMessage] = useState("문제를 만들고 있어요...");
  const [error, setError] = useState<string | null>(null);

  const startQuiz = async (type: UsageType) => {
    setAppState(AppState.LOADING);
    setError(null);
    setLoadingMessage("AI 선생님이 맞춤형 문제를 출제 중입니다...");
    
    try {
      // Generate 5 questions for a quick session
      const generatedQuestions = await generateQuestions(5, type);
      setQuestions(generatedQuestions);
      setQuizState({
        currentQuestionIndex: 0,
        score: 0,
        answers: {},
        isCorrect: {}
      });
      setAppState(AppState.QUIZ);
    } catch (err: any) {
      console.error(err);
      // Display the actual error message thrown by the service
      setError(err.message || "문제를 불러오는 도중 오류가 발생했습니다. 다시 시도해주세요.");
      setAppState(AppState.ERROR);
    }
  };

  const handleAnswer = useCallback((answer: string) => {
    setQuizState(prev => {
      const currentQ = questions[prev.currentQuestionIndex];
      const isCorrect = answer === currentQ.correctAnswer;
      
      return {
        ...prev,
        score: isCorrect ? prev.score + 1 : prev.score,
        answers: { ...prev.answers, [currentQ.id]: answer },
        isCorrect: { ...prev.isCorrect, [currentQ.id]: isCorrect }
      };
    });
  }, [questions]);

  const handleNext = useCallback(() => {
    setQuizState(prev => {
      const nextIndex = prev.currentQuestionIndex + 1;
      if (nextIndex >= questions.length) {
        setAppState(AppState.RESULT);
        return prev;
      }
      return {
        ...prev,
        currentQuestionIndex: nextIndex
      };
    });
  }, [questions.length]);

  const renderContent = () => {
    switch (appState) {
      case AppState.START:
        return (
          <div className="max-w-2xl mx-auto text-center animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-indigo-50">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <GraduationCap size={40} className="text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-3">중3 현재완료 완전 정복</h1>
              <p className="text-slate-500 mb-8">
                'have + p.p.'의 4가지 용법을 마스터해볼까요?<br/>
                AI가 매번 새로운 문제를 만들어줍니다.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                {Object.values(UsageType).map((type) => (
                  <button
                    key={type}
                    onClick={() => startQuiz(type)}
                    className="p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                  >
                    <span className="font-bold text-slate-700 group-hover:text-indigo-700 block mb-1">
                      {type}
                    </span>
                    <span className="text-xs text-slate-400 group-hover:text-indigo-500">
                      5문제 풀기 &rarr;
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case AppState.LOADING:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"></div>
              <Brain className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{loadingMessage}</h2>
            <p className="text-slate-500">잠시만 기다려주세요...</p>
          </div>
        );

      case AppState.QUIZ:
        return (
          <div>
             <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center">
                <span className="font-bold text-indigo-900">Q. {quizState.currentQuestionIndex + 1}</span>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">
                  점수: {quizState.score * 20}점
                </span>
             </div>
            <ProgressBar current={quizState.currentQuestionIndex} total={questions.length} />
            <QuizCard 
              question={questions[quizState.currentQuestionIndex]}
              onAnswer={handleAnswer}
              onNext={handleNext}
              isLastQuestion={quizState.currentQuestionIndex === questions.length - 1}
            />
          </div>
        );

      case AppState.RESULT:
        const percentage = (quizState.score / questions.length) * 100;
        let feedback = "";
        if (percentage === 100) feedback = "완벽해요! 현재완료 마스터시군요! 🎉";
        else if (percentage >= 80) feedback = "아주 잘했어요! 조금만 더 하면 만점! 👍";
        else if (percentage >= 60) feedback = "잘하고 있어요! 틀린 문제를 다시 확인해보세요. 💪";
        else feedback = "괜찮아요! 다시 한번 복습해볼까요? 🌱";

        return (
          <div className="max-w-lg mx-auto text-center animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
              <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-yellow-100 to-orange-100 rounded-full flex items-center justify-center mb-6">
                <Trophy size={48} className="text-orange-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-2">퀴즈 완료!</h2>
              <div className="text-5xl font-black text-indigo-600 mb-4 tracking-tight">
                {quizState.score * 20}<span className="text-2xl text-slate-400 font-medium">점</span>
              </div>
              <p className="text-slate-600 mb-8 bg-slate-50 p-4 rounded-xl">
                {feedback}
              </p>

              <div className="space-y-3">
                <Button fullWidth onClick={() => setAppState(AppState.START)} variant="primary">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCcw size={18} />
                    다시 도전하기
                  </div>
                </Button>
              </div>
            </div>
          </div>
        );

      case AppState.ERROR:
        return (
           <div className="max-w-lg mx-auto text-center mt-12">
            <div className="bg-red-50 p-8 rounded-3xl border border-red-100">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-800 mb-2">오류가 발생했습니다</h3>
              <p className="text-red-600 mb-6 break-words">{error}</p>
              <Button onClick={() => setAppState(AppState.START)} variant="secondary">
                처음으로 돌아가기
              </Button>
            </div>
           </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <header className="max-w-4xl mx-auto mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
          <GraduationCap className="text-white" size={24} />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-800">Grammar<span className="text-indigo-600">Master</span></span>
      </header>
      
      <main className="container mx-auto max-w-4xl">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
export enum UsageType {
  NOUN = '명사적 용법 (Noun)',
  ADJECTIVE = '형용사적 용법 (Adjective)',
  ADVERB = '부사적 용법 (Adverb)',
  MIXED = '종합 (Mixed)'
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  usageType: string; // "명사적", "형용사적", "부사적"
  koreanTranslation: string;
}

export enum AppState {
  START = 'START',
  LOADING = 'LOADING',
  QUIZ = 'QUIZ',
  RESULT = 'RESULT',
  ERROR = 'ERROR'
}

export interface QuizState {
  currentQuestionIndex: number;
  score: number;
  answers: { [questionId: string]: string }; // questionId -> selectedOption
  isCorrect: { [questionId: string]: boolean };
}
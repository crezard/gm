export enum UsageType {
  EXPERIENCE = '경험 (Experience)',
  CONTINUATION = '계속 (Continuation)',
  COMPLETION = '완료 (Completion)',
  RESULT = '결과 (Result)',
  MIXED = '종합 (Mixed)'
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  usageType: string; // "경험", "계속", "완료", "결과"
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
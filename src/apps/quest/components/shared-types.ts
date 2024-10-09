// shared-types.ts

export interface QuizQuestion {
    id: number;
    text: string;
    options: Array<{
      letter: string;
      text: string;
    }>;
  }
  
  export interface QuizData {
    id?: number;
    name?: string;
    questions?: string | QuizQuestion[];
    required_pass_score?: number;
    summary?: string;
    document_id?: number;
    num_questions?: number;
    blockId?: number;
  }
  
  export interface QuizResults {
    score: number;
    feedback: string;
    questionFeedback: Array<{
      id: number;
      correct: boolean;
      feedback: string;
    }>;
    userAnswers: Record<number, string>;
  }
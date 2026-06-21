export interface SymptomQuestion {
  question_key: string;
  question_text: string;
  question_type: "range" | "boolean" | "selection";
  min_value: number;
  max_value: number;
  question_options?: QuestionOption[];
}

export interface QuestionOption {
  label: string;
  value: number;
}

export interface DiseaseQuestion extends SymptomQuestion {
  question_type: "range" | "selection";
}

export interface OverrideQuestion extends SymptomQuestion {
  question_type: "boolean";
}

export interface UnifiedQuestion extends SymptomQuestion {
  isOverride: boolean;
}

export interface SymptomQuestionsResponse {
  diseaseQuestions: DiseaseQuestion[];
  overrideQuestions: OverrideQuestion[];
}

export interface SubmissionPayload {
  answers: Record<string, number>;
  overrideAnswers: Record<string, boolean>;
}

export interface SubmissionResult {
  trendStatus: "green" | "yellow" | "red";
  dayNumber: number;
  diseaseScore: number;
  overrideTriggered: boolean;
  message: string;
  images?: string[];
}

export type Answers = Record<string, number | boolean>;

export interface LabelInfo {
  label: string;
  color: string;
  emoji: string;
  bg: string;
  tc: string;
}

export interface TrendInfo {
  icon: string;
  bg: string;
  tc: string;
  label: string;
}

export interface BooleanQuestionProps {
  question: OverrideQuestion;
  value: boolean | undefined;
  onChange: (val: boolean) => void;
}

export interface RangeQuestionProps {
  autoScrollEnabled: boolean;
  question: DiseaseQuestion;
  value: number | undefined;
  onChange: (val: number) => void;
}

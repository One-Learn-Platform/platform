export enum QuestionType {
	SHORT_ANSWER = "short-answer",
	LONG_ANSWER = "long-answer",
	MULTIPLE_CHOICE = "multiple-choice",
}
export const QUESTION_TYPE_VALUE = [
	QuestionType.SHORT_ANSWER,
	QuestionType.LONG_ANSWER,
	QuestionType.MULTIPLE_CHOICE,
] as const;

export type Question =
	| {
			key: string;
			question: string;
			type: "short-answer" | "long-answer";
			answer: string;
			attachment?: string[];
			upload?: FileList;
	  }
	| {
			key: string;
			question: string;
			type: "multiple-choice";
			answer: string;
			attachment?: string[];
			upload?: FileList;
			choices: Array<{ key: string; value: string }>;
			correctChoice: string; //key of choices
	  };

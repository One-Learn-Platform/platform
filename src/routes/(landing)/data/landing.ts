import {
	AlarmClockCheck,
	BookOpen,
	ChartArea,
	ListTodo,
	MessagesSquare,
	Trophy,
} from "@lucide/svelte";

export const stats = [
	{
		label: "Students",
		value: "900K+",
	},
	{
		label: "Schools",
		value: "9K+",
	},
	{
		label: "Materials Created",
		value: "1M+",
	},
	{
		label: "Forums Created",
		value: "1M+",
	},
];

export const features = [
	{
		icon: AlarmClockCheck,
		title: "Rapid Quiz",
		description: "Create time limited rapid quiz to boost student competitiveness and engagement.",
	},
	{
		icon: Trophy,
		title: "Leaderboard",
		description:
			"Motivate students with a leaderboard that tracks their progress and achievements.",
	},
	{
		icon: ListTodo,
		title: "Make Assignment",
		description: "Assign tasks to students, collect submissions, and automate grading.",
	},
	{
		icon: MessagesSquare,
		title: "Create Forum",
		description:
			"Facilitate discussions, share resources, and foster collaboration among students.",
	},
	{
		icon: BookOpen,
		title: "Manage Material",
		description: "Create and organize course materials, including documents, and videos",
	},
	{
		icon: ChartArea,
		title: "Grade Analytics",
		description: "Track assignment results and student performance.",
	},
];

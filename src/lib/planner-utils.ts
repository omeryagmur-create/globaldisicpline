import { addDays, differenceInDays, isSunday, isSaturday } from "date-fns";

interface Subject {
    name: string;
    weight: number; // 1-10 priority
}

interface PlanConfig {
    examDate: Date;
    dailyHours: number;
    subjects: Subject[];
}

const TOPIC_TEMPLATES = [
    "Fundamental Concepts & Theory",
    "Problem Solving Session",
    "Past Exam Questions Practice",
    "Deep Dive into Difficult Topics",
    "Revision of Last Weak Areas",
    "Flashcards & Active Recall",
    "Simulated Test Practice"
];

export function generatePlan(config: PlanConfig) {
    const { examDate, dailyHours, subjects } = config;
    const today = new Date();
    // Start from tomorrow
    const startDate = addDays(today, 1);
    const totalDays = differenceInDays(examDate, today);
    const totalWeeks = Math.ceil(totalDays / 7);

    const tasks = [];



    // Subjects pool based on weight for round-robin distribution
    const subjectPool: string[] = [];
    subjects.forEach(s => {
        for (let i = 0; i < s.weight; i++) {
            subjectPool.push(s.name);
        }
    });

    let poolIndex = 0;

    for (let day = 0; day < totalDays; day++) {
        const currentDate = addDays(startDate, day);

        // Sunday is traditionally a Rest/Review day
        if (isSunday(currentDate)) {
            tasks.push({
                task_date: currentDate.toISOString(),
                subject: "Mixed Review",
                topic: "Weekly Summary & Weak Area Revision",
                estimated_duration: Math.max(60, dailyHours * 30), // Lighter study on Sundays
                is_completed: false
            });
            continue;
        }

        // Saturday is for simulated tests if we are within 4 weeks of exam
        if (isSaturday(currentDate) && totalDays - day < 28) {
            tasks.push({
                task_date: currentDate.toISOString(),
                subject: "Full Mock Test",
                topic: "Simulated Exam Conditions Practice",
                estimated_duration: 180, // Heavy session
                is_completed: false
            });
            continue;
        }

        let remainingDailyMinutes = dailyHours * 60;
        const sessionCount = Math.max(1, Math.floor(dailyHours / 1.5)); // Usually split into sessions
        const minutesPerSession = Math.floor(remainingDailyMinutes / sessionCount);

        for (let s = 0; s < sessionCount; s++) {
            if (remainingDailyMinutes < 30) break;

            const selectedSubject = subjectPool[poolIndex % subjectPool.length];
            poolIndex++;

            const template = TOPIC_TEMPLATES[Math.floor(Math.random() * TOPIC_TEMPLATES.length)];

            tasks.push({
                task_date: currentDate.toISOString(),
                subject: selectedSubject,
                topic: `${template} - ${selectedSubject}`,
                estimated_duration: minutesPerSession,
                is_completed: false
            });

            remainingDailyMinutes -= minutesPerSession;
        }
    }

    return {
        totalWeeks,
        generatedTasks: tasks
    };
}

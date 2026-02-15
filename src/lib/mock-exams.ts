export type MockExamType = 'YKS' | 'LGS' | 'KPSS' | 'Custom';

export interface SubjectResult {
    subject: string;
    correct: number;
    wrong: number;
    empty: number;
}

export interface MockExamData {
    examType: MockExamType;
    examDate: Date;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    emptyAnswers: number;
    netScore: number;
    subjectBreakdown: SubjectResult[];
}

export function calculateNetScore(correct: number, wrong: number, type: MockExamType = 'YKS'): number {
    // Standard formula: Net = Correct - (Wrong / 4)
    // Adjust if needed for other exam types
    if (type === 'LGS') {
        return correct - (wrong / 3);
    }
    return correct - (wrong / 4);
}

export function calculateSuccessRate(correct: number, total: number): number {
    if (total === 0) return 0;
    return (correct / total) * 100;
}

export const EXAM_TYPES: MockExamType[] = ['YKS', 'LGS', 'KPSS', 'Custom'];

export const SUBJECTS_BY_TYPE: Record<MockExamType, string[]> = {
    'YKS': ['TYT Türkçe', 'TYT Matematik', 'TYT Sosyal', 'TYT Fen', 'AYT Matematik', 'AYT Fizik', 'AYT Kimya', 'AYT Biyoloji', 'AYT Edebiyat', 'AYT Tarih', 'AYT Coğrafya'],
    'LGS': ['Türkçe', 'Matematik', 'Fen Bilimleri', 'T.C. İnkılap Tarihi', 'Din Kültürü', 'İngilizce'],
    'KPSS': ['Genel Yetenek', 'Genel Kültür', 'Eğitim Bilimleri'],
    'Custom': ['Subject 1', 'Subject 2', 'Subject 3', 'Subject 4']
};

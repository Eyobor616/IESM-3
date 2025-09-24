
export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export enum LessonType {
  VIDEO = 'VIDEO',
  TEXT = 'TEXT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
}

export interface Attachment {
  id: string;
  name:string;
  type: 'PDF' | 'ZIP' | 'DOCX';
  url: string;
}

export interface Lesson {
  id: string;
  title: string;
  type: LessonType;
  content: string; // URL for video, markdown for text
  durationMinutes: number;
  attachments: Attachment[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructorIds: string[];
  lessons: Lesson[];
  quizId?: string;
  prerequisiteCourseId?: string;
  thumbnailUrl: string;
  category: string;
}

export interface Enrollment {
  userId: string;
  courseId: string;
  progress: number; // Percentage
  completedLessons: string[]; // Array of lesson IDs
}

export interface QuizAttempt {
  userId: string;
  quizId: string;
  score: number; // Percentage
  answers: (number | null)[]; // Array of selected answer indices
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  issueDate: string;
}

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  date: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  link?: {
    page: 'course' | 'certificate';
    id: string;
  };
}

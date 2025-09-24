
import { User, Course, Enrollment, Quiz, Review, Notification, UserRole, LessonType } from './types';

export const initialUsers: User[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@edu.com', role: UserRole.STUDENT, avatarUrl: 'https://picsum.photos/seed/u1/100' },
  { id: 'u2', name: 'Bob Williams', email: 'bob@edu.com', role: UserRole.STUDENT, avatarUrl: 'https://picsum.photos/seed/u2/100' },
  { id: 'u3', name: 'Dr. Carol Davis', email: 'carol@edu.com', role: UserRole.INSTRUCTOR, avatarUrl: 'https://picsum.photos/seed/u3/100' },
  { id: 'u4', name: 'Admin User', email: 'admin@edu.com', role: UserRole.ADMIN, avatarUrl: 'https://picsum.photos/seed/u4/100' },
  { id: 'u5', name: 'Dr. David Smith', email: 'david@edu.com', role: UserRole.INSTRUCTOR, avatarUrl: 'https://picsum.photos/seed/u5/100' },
];

export const initialQuizzes: Quiz[] = [
  {
    id: 'q1', title: 'React Basics Quiz', questions: [
      { id: 'q1q1', text: 'What is JSX?', options: ['A JavaScript syntax extension', 'A CSS preprocessor', 'A database query language', 'A templating engine'], correctAnswerIndex: 0 },
      { id: 'q1q2', text: 'How do you pass data to a component?', options: ['State', 'Props', 'Variables', 'Functions'], correctAnswerIndex: 1 },
      { id: 'q1q3', text: 'What hook is used for state management in functional components?', options: ['useEffect', 'useContext', 'useState', 'useReducer'], correctAnswerIndex: 2 }
    ]
  },
  {
    id: 'q2', title: 'Advanced CSS Quiz', questions: [
        { id: 'q2q1', text: 'What does CSS stand for?', options: ['Cascading Style Sheets', 'Creative Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'], correctAnswerIndex: 0 },
        { id: 'q2q2', text: 'Which property is used to change the background color?', options: ['color', 'bgcolor', 'background-color', 'background'], correctAnswerIndex: 2 },
    ]
  }
];

export const initialCourses: Course[] = [
  {
    id: 'c1', title: 'Introduction to React', category: 'Web Development',
    description: 'Learn the fundamentals of React, including components, state, props, and hooks. This course is perfect for beginners.',
    instructorIds: ['u3'], thumbnailUrl: 'https://picsum.photos/seed/c1/400/225', quizId: 'q1',
    lessons: [
      { id: 'c1l1', title: 'Course Introduction', type: LessonType.VIDEO, content: 'intro.mp4', durationMinutes: 5, attachments: [] },
      { id: 'c1l2', title: 'What is React?', type: LessonType.TEXT, content: 'React is a JavaScript library for building user interfaces.', durationMinutes: 15, attachments: [{ id: 'a1', name: 'React_Docs.pdf', type: 'PDF', url: '#' }] },
      { id: 'c1l3', title: 'Components and Props', type: LessonType.VIDEO, content: 'components.mp4', durationMinutes: 25, attachments: [] },
    ]
  },
  {
    id: 'c2', title: 'Advanced CSS and Sass', category: 'Web Design',
    description: 'Dive deep into modern CSS features like Flexbox, Grid, and animations. Also, learn how to use Sass for more maintainable stylesheets.',
    instructorIds: ['u5'], thumbnailUrl: 'https://picsum.photos/seed/c2/400/225', prerequisiteCourseId: 'c3', quizId: 'q2',
    lessons: [
      { id: 'c2l1', title: 'Flexbox Fundamentals', type: LessonType.VIDEO, content: 'flexbox.mp4', durationMinutes: 30, attachments: [] },
      { id: 'c2l2', title: 'CSS Grid Layout', type: LessonType.VIDEO, content: 'grid.mp4', durationMinutes: 45, attachments: [] },
    ]
  },
  {
    id: 'c3', title: 'HTML5 for Beginners', category: 'Web Development',
    description: 'Start your web development journey by mastering the structure of web pages with HTML5.',
    instructorIds: ['u5'], thumbnailUrl: 'https://picsum.photos/seed/c3/400/225',
    lessons: [
      { id: 'c3l1', title: 'HTML Basics', type: LessonType.TEXT, content: 'Learn the basic tags of HTML.', durationMinutes: 20, attachments: [] },
    ]
  },
];

export const initialEnrollments: Enrollment[] = [
  { userId: 'u1', courseId: 'c1', progress: 33, completedLessons: ['c1l1'] },
  { userId: 'u1', courseId: 'c3', progress: 100, completedLessons: ['c3l1'] },
  { userId: 'u2', courseId: 'c3', progress: 100, completedLessons: ['c3l1'] },
];

export const initialReviews: Review[] = [
    {id: 'r1', courseId: 'c3', userId: 'u1', rating: 5, comment: 'Great introductory course!', date: new Date(Date.now() - 86400000 * 2).toISOString()},
    {id: 'r2', courseId: 'c3', userId: 'u2', rating: 4, comment: 'Very helpful, but could use more examples.', date: new Date(Date.now() - 86400000).toISOString()},
];

export const initialNotifications: Notification[] = [
    { id: 'n1', userId: 'u3', message: 'Alice Johnson enrolled in your course: Introduction to React', isRead: false, timestamp: new Date().toISOString() },
];

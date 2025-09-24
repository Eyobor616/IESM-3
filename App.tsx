
import React, { useState, useContext, createContext, ReactNode, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks';
import { initialUsers, initialCourses, initialQuizzes, initialEnrollments, initialReviews, initialNotifications } from './data';
import * as T from './types';
import {
    Button, Card, Modal, ProgressBar, StarRating,
    HomeIcon, BookOpenIcon, PlusCircleIcon, UserGroupIcon, BellIcon, LogoutIcon, ChevronLeftIcon,
    VideoCameraIcon, DocumentTextIcon, CheckCircleIcon, PlayIcon
} from './components';

// --- APP CONTEXT --- //
interface AppContextType {
    users: T.User[];
    courses: T.Course[];
    quizzes: T.Quiz[];
    enrollments: T.Enrollment[];
    reviews: T.Review[];
    notifications: T.Notification[];
    certificates: T.Certificate[];
    currentUser: T.User | null;
    login: (userId: string) => void;
    logout: () => void;
    enrollInCourse: (courseId: string) => void;
    completeLesson: (courseId: string, lessonId: string) => void;
    submitReview: (courseId: string, rating: number, comment: string) => void;
    submitQuiz: (quizId: string, answers: (number | null)[]) => T.QuizAttempt;
    addUser: (user: Omit<T.User, 'id' | 'avatarUrl'>) => void;
    updateCourse: (course: T.Course) => void;
    addCourse: (course: Omit<T.Course, 'id'>) => void;
    addQuiz: (quiz: Omit<T.Quiz, 'id'>) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useLocalStorage<T.User[]>('eduverse_users', initialUsers);
    const [courses, setCourses] = useLocalStorage<T.Course[]>('eduverse_courses', initialCourses);
    const [quizzes, setQuizzes] = useLocalStorage<T.Quiz[]>('eduverse_quizzes', initialQuizzes);
    const [enrollments, setEnrollments] = useLocalStorage<T.Enrollment[]>('eduverse_enrollments', initialEnrollments);
    const [reviews, setReviews] = useLocalStorage<T.Review[]>('eduverse_reviews', initialReviews);
    const [notifications, setNotifications] = useLocalStorage<T.Notification[]>('eduverse_notifications', initialNotifications);
    const [certificates, setCertificates] = useLocalStorage<T.Certificate[]>('eduverse_certificates', []);
    const [quizAttempts, setQuizAttempts] = useLocalStorage<T.QuizAttempt[]>('eduverse_quiz_attempts', []);
    const [currentUser, setCurrentUser] = useLocalStorage<T.User | null>('eduverse_currentUser', null);

    const login = (userId: string) => {
        const user = users.find(u => u.id === userId);
        if (user) setCurrentUser(user);
    };
    const logout = () => setCurrentUser(null);
    
    const enrollInCourse = (courseId: string) => {
        if (!currentUser) return;
        const isEnrolled = enrollments.some(e => e.userId === currentUser.id && e.courseId === courseId);
        if (isEnrolled) return;
        const newEnrollment: T.Enrollment = { userId: currentUser.id, courseId, progress: 0, completedLessons: [] };
        setEnrollments(prev => [...prev, newEnrollment]);
    };

    const completeLesson = (courseId: string, lessonId: string) => {
        if (!currentUser) return;
        setEnrollments(prev => prev.map(e => {
            if (e.userId === currentUser.id && e.courseId === courseId && !e.completedLessons.includes(lessonId)) {
                const course = courses.find(c => c.id === courseId);
                const completedLessons = [...e.completedLessons, lessonId];
                const progress = course ? Math.round((completedLessons.length / course.lessons.length) * 100) : e.progress;
                return { ...e, completedLessons, progress };
            }
            return e;
        }));
    };
    
    const submitReview = (courseId: string, rating: number, comment: string) => {
        if (!currentUser) return;
        const newReview: T.Review = {
            id: `r${Date.now()}`,
            courseId,
            userId: currentUser.id,
            rating,
            comment,
            date: new Date().toISOString()
        };
        setReviews(prev => [newReview, ...prev]);
    };

    const submitQuiz = (quizId: string, answers: (number|null)[]) => {
        if (!currentUser) throw new Error("User not logged in");
        const quiz = quizzes.find(q => q.id === quizId);
        if(!quiz) throw new Error("Quiz not found");

        let correctCount = 0;
        quiz.questions.forEach((q, i) => {
            if (answers[i] === q.correctAnswerIndex) {
                correctCount++;
            }
        });
        const score = Math.round((correctCount / quiz.questions.length) * 100);
        const newAttempt: T.QuizAttempt = { userId: currentUser.id, quizId, score, answers };
        setQuizAttempts(prev => [...prev, newAttempt]);

        const course = courses.find(c => c.quizId === quizId);
        const enrollment = enrollments.find(e => e.userId === currentUser.id && e.courseId === course?.id);

        if (course && score >= 80 && enrollment?.progress === 100) {
            const hasCertificate = certificates.some(c => c.userId === currentUser.id && c.courseId === course.id);
            if (!hasCertificate) {
                const newCertificate: T.Certificate = {
                    id: `cert${Date.now()}`,
                    userId: currentUser.id,
                    courseId: course.id,
                    issueDate: new Date().toISOString()
                };
                setCertificates(prev => [...prev, newCertificate]);
                setNotifications(prev => [{
                    id: `n${Date.now()}`,
                    userId: currentUser!.id,
                    message: `Congratulations! You've earned a certificate for ${course.title}.`,
                    isRead: false,
                    timestamp: new Date().toISOString(),
                    link: { page: 'certificate', id: newCertificate.id }
                }, ...prev]);
            }
        }
        return newAttempt;
    };
    
    const addUser = (user: Omit<T.User, 'id' | 'avatarUrl'>) => {
        const newUser: T.User = {
            id: `u${Date.now()}`,
            avatarUrl: `https://picsum.photos/seed/u${Date.now()}/100`,
            ...user,
        };
        setUsers(prev => [...prev, newUser]);
    };

    const addQuiz = (quiz: Omit<T.Quiz, 'id'>) => {
        const newQuiz: T.Quiz = { id: `q${Date.now()}`, ...quiz };
        setQuizzes(prev => [...prev, newQuiz]);
        return newQuiz.id;
    }
    
    const addCourse = (course: Omit<T.Course, 'id'>) => {
        const newCourse: T.Course = { id: `c${Date.now()}`, ...course };
        setCourses(prev => [...prev, newCourse]);
    };
    
    const updateCourse = (updatedCourse: T.Course) => {
        setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
    };

    const value = {
        users, courses, quizzes, enrollments, reviews, notifications, certificates, currentUser,
        login, logout, enrollInCourse, completeLesson, submitReview, submitQuiz, addUser, updateCourse, addCourse, addQuiz
    };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};

// --- "PAGE" COMPONENTS --- //

const LoginPage = () => {
    const { users, login } = useAppContext();
    return (
        <div className="min-h-screen bg-brand-light flex items-center justify-center">
            <Card className="w-full max-w-md text-center">
                <h1 className="text-3xl font-bold text-brand-primary mb-2">Welcome to EduVerse</h1>
                <p className="text-brand-text-light mb-8">Please select a user to log in</p>
                <div className="space-y-4">
                    {users.map(user => (
                        <button key={user.id} onClick={() => login(user.id)} className="w-full flex items-center p-4 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
                            <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full mr-4" />
                            <div className="text-left">
                                <p className="font-semibold text-brand-primary">{user.name}</p>
                                <p className="text-sm text-brand-text-light">{user.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </Card>
        </div>
    );
};

// ... Course, Lesson, Quiz components would be here ...

const CourseCard: React.FC<{ course: T.Course; onSelect: () => void; enrollment?: T.Enrollment }> = ({ course, onSelect, enrollment }) => {
    const { users } = useAppContext();
    const instructor = users.find(u => u.id === course.instructorIds[0]);

    return (
        <Card className="flex flex-col h-full cursor-pointer hover:shadow-xl transition-shadow" onClick={onSelect}>
            <img src={course.thumbnailUrl} alt={course.title} className="rounded-t-lg w-full h-40 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-sm text-brand-accent font-semibold">{course.category}</p>
                <h3 className="text-lg font-bold text-brand-primary mt-1 mb-2 flex-grow">{course.title}</h3>
                {instructor && (
                    <div className="flex items-center text-sm text-brand-text-light mt-2">
                        <img src={instructor.avatarUrl} alt={instructor.name} className="w-6 h-6 rounded-full mr-2" />
                        <span>{instructor.name}</span>
                    </div>
                )}
                {enrollment && (
                    <div className="mt-4">
                        <ProgressBar progress={enrollment.progress} />
                        <p className="text-xs text-right mt-1 text-brand-text-light">{enrollment.progress}% Complete</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

const DashboardPage: React.FC<{ navigate: (view: any) => void }> = ({ navigate }) => {
    const { currentUser, courses, enrollments } = useAppContext();
    const myEnrollments = enrollments.filter(e => e.userId === currentUser?.id);
    const myCourses = myEnrollments.map(e => ({
        enrollment: e,
        course: courses.find(c => c.id === e.courseId)
    })).filter(item => item.course);

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-6">Dashboard</h1>
            <h2 className="text-xl font-semibold text-brand-primary mb-4">My Courses</h2>
            {myCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map(({ course, enrollment }) => course && (
                        <CourseCard key={course.id} course={course} enrollment={enrollment} onSelect={() => navigate({ page: 'course', id: course.id })} />
                    ))}
                </div>
            ) : (
                <p className="text-brand-text-light">You are not enrolled in any courses yet. <span onClick={() => navigate({ page: 'catalog' })} className="text-brand-secondary hover:underline cursor-pointer">Browse catalog</span>.</p>
            )}
        </div>
    );
};

const CourseCatalogPage: React.FC<{ navigate: (view: any) => void }> = ({ navigate }) => {
    const { courses } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');

    const filteredCourses = useMemo(() => {
        return courses.filter(course =>
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (category === 'All' || course.category === category)
        );
    }, [courses, searchTerm, category]);

    const categories = ['All', ...Array.from(new Set(courses.map(c => c.category)))];

    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-6">Course Catalog</h1>
            <div className="flex space-x-4 mb-6">
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border rounded-md"
                />
                <select value={category} onChange={e => setCategory(e.target.value)} className="p-2 border rounded-md">
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                    <CourseCard key={course.id} course={course} onSelect={() => navigate({ page: 'course', id: course.id })} />
                ))}
            </div>
        </div>
    );
};

const CourseDetailsPage: React.FC<{ courseId: string; navigate: (view: any) => void }> = ({ courseId, navigate }) => {
    const { courses, users, enrollments, reviews, currentUser, enrollInCourse } = useAppContext();
    const course = courses.find(c => c.id === courseId);
    const enrollment = enrollments.find(e => e.userId === currentUser?.id && e.courseId === courseId);

    if (!course) return <div>Course not found</div>;

    const instructors = users.filter(u => course.instructorIds.includes(u.id));
    const courseReviews = reviews.filter(r => r.courseId === course.id);
    const avgRating = courseReviews.length > 0 ? courseReviews.reduce((acc, r) => acc + r.rating, 0) / courseReviews.length : 0;

    const prerequisiteCourse = courses.find(c => c.id === course.prerequisiteCourseId);
    const isPrerequisiteCompleted = !prerequisiteCourse || enrollments.some(e =>
        e.userId === currentUser?.id && e.courseId === prerequisiteCourse.id && e.progress === 100);

    const handleStartCourse = () => {
        if (!enrollment) return;
        const firstLessonId = course.lessons[0]?.id;
        if(firstLessonId) {
             navigate({ page: 'lesson', courseId: course.id, lessonId: firstLessonId });
        }
    }

    return (
        <div>
            <button onClick={() => navigate({ page: 'catalog' })} className="flex items-center text-brand-secondary mb-4 hover:underline">
                <ChevronLeftIcon /> Back to Catalog
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <h1 className="text-3xl font-bold text-brand-primary">{course.title}</h1>
                        <p className="text-brand-text mt-2">{course.description}</p>
                        <div className="flex items-center mt-4">
                            <StarRating rating={avgRating} />
                            <span className="ml-2 text-brand-text-light">({courseReviews.length} reviews)</span>
                        </div>
                    </Card>
                    <div className="mt-8">
                        <h2 className="text-2xl font-semibold text-brand-primary mb-4">Course Content</h2>
                        <div className="space-y-2">
                            {course.lessons.map(lesson => (
                                <div key={lesson.id}
                                    className={`flex items-center justify-between p-4 rounded-md transition-colors ${enrollment ? 'cursor-pointer hover:bg-blue-50' : 'cursor-default bg-gray-50'}`}
                                    onClick={() => enrollment && navigate({ page: 'lesson', courseId: course.id, lessonId: lesson.id })}
                                >
                                    <div className="flex items-center">
                                        {enrollment?.completedLessons.includes(lesson.id) ? <CheckCircleIcon className="text-brand-success mr-3"/> :
                                        (lesson.type === T.LessonType.VIDEO ? <VideoCameraIcon className="text-brand-accent mr-3" /> : <DocumentTextIcon className="text-brand-accent mr-3" />)}
                                        <span className="font-medium text-brand-primary">{lesson.title}</span>
                                    </div>
                                    <span className="text-sm text-brand-text-light">{lesson.durationMinutes} min</span>
                                </div>
                            ))}
                            {course.quizId && (
                                <div className={`flex items-center justify-between p-4 rounded-md transition-colors ${enrollment?.progress === 100 ? 'cursor-pointer hover:bg-blue-50' : 'cursor-default bg-gray-50'}`}
                                     onClick={() => enrollment?.progress === 100 && navigate({ page: 'quiz', courseId: course.id, quizId: course.quizId })}>
                                    <div className="flex items-center">
                                         <CheckCircleIcon className="text-brand-accent mr-3"/>
                                         <span className="font-medium text-brand-primary">Final Quiz</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div>
                    <Card>
                        <img src={course.thumbnailUrl} alt={course.title} className="w-full rounded-md mb-4" />
                        {enrollment ? (
                             <Button onClick={handleStartCourse} className="w-full">
                                {enrollment.progress > 0 ? 'Continue Course' : 'Start Course'}
                             </Button>
                        ) : (
                             <Button onClick={() => enrollInCourse(course.id)} disabled={!isPrerequisiteCompleted} className="w-full">
                                Enroll Now
                             </Button>
                        )}
                        {!isPrerequisiteCompleted && <p className="text-xs text-brand-danger mt-2 text-center">Requires completion of: {prerequisiteCourse?.title}</p>}
                    </Card>
                    <Card className="mt-6">
                        <h3 className="font-semibold text-brand-primary mb-3">Instructors</h3>
                        {instructors.map(inst => (
                            <div key={inst.id} className="flex items-center mb-2">
                                <img src={inst.avatarUrl} alt={inst.name} className="w-10 h-10 rounded-full mr-3" />
                                <div>
                                    <p className="font-medium">{inst.name}</p>
                                    <p className="text-sm text-brand-text-light">{inst.role}</p>
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </div>
    );
};

const LessonPage: React.FC<{ courseId: string; lessonId: string; navigate: (view: any) => void }> = ({ courseId, lessonId, navigate }) => {
    const { courses, completeLesson } = useAppContext();
    const course = courses.find(c => c.id === courseId);
    const lesson = course?.lessons.find(l => l.id === lessonId);
    const lessonIndex = course?.lessons.findIndex(l => l.id === lessonId) ?? -1;
    
    const handleComplete = () => {
        completeLesson(courseId, lessonId);
        if (course && lessonIndex < course.lessons.length - 1) {
            navigate({ page: 'lesson', courseId, lessonId: course.lessons[lessonIndex + 1].id });
        } else if (course && course.quizId) {
            navigate({ page: 'quiz', courseId, quizId: course.quizId });
        } else {
            navigate({ page: 'course', id: courseId });
        }
    };
    
    if (!course || !lesson) return <div>Lesson not found</div>;
    
    return (
        <div>
             <button onClick={() => navigate({ page: 'course', id: courseId })} className="flex items-center text-brand-secondary mb-4 hover:underline">
                <ChevronLeftIcon /> Back to Course
            </button>
            <div className="flex">
                <div className="w-3/4 pr-8">
                    <Card>
                        <h1 className="text-3xl font-bold text-brand-primary mb-4">{lesson.title}</h1>
                        {lesson.type === T.LessonType.VIDEO ? (
                            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                                <PlayIcon />
                            </div>
                        ) : (
                            <div className="prose max-w-none">
                                <p>{lesson.content}</p>
                            </div>
                        )}
                    </Card>
                    <div className="mt-6 text-right">
                        <Button onClick={handleComplete}>Mark as Complete & Continue</Button>
                    </div>
                </div>
                <div className="w-1/4">
                    <Card>
                        <h3 className="font-semibold text-brand-primary mb-3">Course Lessons</h3>
                        <ul className="space-y-2">
                        {course.lessons.map(l => (
                            <li key={l.id}
                                onClick={() => navigate({ page: 'lesson', courseId, lessonId: l.id })}
                                className={`p-2 rounded cursor-pointer ${l.id === lessonId ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                            >
                                {l.title}
                            </li>
                        ))}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}

const QuizPage: React.FC<{ courseId: string; quizId: string; navigate: (view: any) => void }> = ({ courseId, quizId, navigate }) => {
    const { quizzes, submitQuiz } = useAppContext();
    const quiz = quizzes.find(q => q.id === quizId);
    const [answers, setAnswers] = useState<(number | null)[]>([]);
    const [result, setResult] = useState<T.QuizAttempt | null>(null);

    if (!quiz) return <div>Quiz not found</div>;

    if (answers.length === 0) {
        setAnswers(new Array(quiz.questions.length).fill(null));
    }

    const handleAnswer = (questionIndex: number, optionIndex: number) => {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = optionIndex;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        const attempt = submitQuiz(quizId, answers);
        setResult(attempt);
    };

    if (result) {
        return (
            <Card className="text-center">
                <h1 className="text-3xl font-bold text-brand-primary mb-4">Quiz Results</h1>
                <p className="text-5xl font-bold mb-2" style={{color: result.score >= 80 ? '#28A745' : '#DC3545'}}>{result.score}%</p>
                <p className="text-brand-text-light mb-6">You answered {Math.round(result.score/100 * quiz.questions.length)} out of {quiz.questions.length} questions correctly.</p>
                <Button onClick={() => navigate({ page: 'course', id: courseId })}>Back to Course</Button>
            </Card>
        );
    }
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-brand-primary mb-6">{quiz.title}</h1>
            <Card>
                <div className="space-y-8">
                {quiz.questions.map((q, qIndex) => (
                    <div key={q.id}>
                        <p className="font-semibold text-lg mb-4">{qIndex + 1}. {q.text}</p>
                        <div className="space-y-2">
                            {q.options.map((opt, oIndex) => (
                                <label key={oIndex} className={`flex items-center p-3 border rounded-md cursor-pointer ${answers[qIndex] === oIndex ? 'bg-blue-100 border-blue-400' : 'border-gray-200'}`}>
                                    <input type="radio" name={`q${qIndex}`} className="mr-3" checked={answers[qIndex] === oIndex} onChange={() => handleAnswer(qIndex, oIndex)}/>
                                    {opt}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
                </div>
                <div className="text-center mt-8">
                    <Button onClick={handleSubmit}>Submit Quiz</Button>
                </div>
            </Card>
        </div>
    );
};


// --- MAIN APP --- //

type View =
  | { page: 'dashboard' }
  | { page: 'catalog' }
  | { page: 'admin' }
  | { page: 'builder'; id?: string }
  | { page: 'course'; id: string }
  | { page: 'lesson'; courseId: string; lessonId: string }
  | { page: 'quiz'; courseId: string; quizId: string };

const App = () => {
    const { currentUser, logout } = useAppContext();
    const [view, setView] = useState<View>({ page: 'dashboard' });

    if (!currentUser) {
        return <LoginPage />;
    }
    
    const renderContent = () => {
        switch (view.page) {
            case 'dashboard': return <DashboardPage navigate={setView} />;
            case 'catalog': return <CourseCatalogPage navigate={setView} />;
            case 'course': return <CourseDetailsPage courseId={view.id} navigate={setView} />;
            case 'lesson': return <LessonPage courseId={view.courseId} lessonId={view.lessonId} navigate={setView} />;
            case 'quiz': return <QuizPage courseId={view.courseId} quizId={view.quizId} navigate={setView} />;
            // Admin and Instructor pages would be added here
            default: return <DashboardPage navigate={setView} />;
        }
    };

    const NavLink: React.FC<{ icon: ReactNode; label: string; view: View }> = ({ icon, label, view: targetView }) => (
        <li
            onClick={() => setView(targetView)}
            className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors ${view.page === targetView.page ? 'bg-brand-accent text-white' : 'hover:bg-brand-primary/50'}`}
        >
            {icon}
            <span>{label}</span>
        </li>
    );

    return (
        <div className="flex h-screen bg-brand-light font-sans">
            <aside className="w-64 bg-brand-primary text-white p-4 flex flex-col">
                <h1 className="text-2xl font-bold mb-8">EduVerse</h1>
                <nav className="flex-grow">
                    <ul className="space-y-2">
                       <NavLink icon={<HomeIcon />} label="Dashboard" view={{ page: 'dashboard' }} />
                       <NavLink icon={<BookOpenIcon />} label="All Courses" view={{ page: 'catalog' }} />
                       {currentUser.role !== T.UserRole.STUDENT && (
                           <NavLink icon={<PlusCircleIcon />} label="Course Builder" view={{ page: 'builder' }} />
                       )}
                       {currentUser.role === T.UserRole.ADMIN && (
                           <NavLink icon={<UserGroupIcon />} label="Admin" view={{ page: 'admin' }} />
                       )}
                    </ul>
                </nav>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <div>{/* Search bar can go here */}</div>
                    <div className="flex items-center space-x-4">
                        <BellIcon className="text-gray-500 cursor-pointer" />
                        <div className="flex items-center">
                            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                            <div className="ml-2">
                                <p className="font-semibold text-sm">{currentUser.name}</p>
                                <p className="text-xs text-gray-500">{currentUser.role}</p>
                            </div>
                        </div>
                        <button onClick={logout} title="Logout">
                           <LogoutIcon className="text-gray-500" />
                        </button>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default App;

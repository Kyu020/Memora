'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import CollapsibleSidebar from '@/app/sidebar';
import { authService } from '@/services/auth.service';
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Loader2,
} from 'lucide-react';
import './take-quiz.css';

interface Question {
  _id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

interface Quiz {
  _id: string;
  title: string;
  quiz_type: string;
  difficulty: string;
  time_limit: number | null;
  questions: Question[];
}

interface Answer {
  question_id: string;
  user_answer: string;
  time_spent: number;
}

interface CurrentUser {
  name: string;
  email: string;
}

const TakeQuizPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const quizId = params.quizId as string;

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null | undefined>(undefined); // undefined = not checked yet
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [startTime] = useState<Date>(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Subscribe to auth changes
  useEffect(() => {
    const currentToken = authService.getToken();
    setToken(currentToken);

    // Check if token exists, if not redirect
    if (!currentToken) {
      setError('You must be logged in to take a quiz.');
      setLoading(false);
      router.push('/auth');
      return;
    }

    const unsubscribe = authService.subscribe((u) => {
      if (u) {
        setUser({ name: u.username, email: u.email });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (token) {
      fetchQuiz();
    } else if (token === null) {
      // Token is explicitly null (not just uninitialized)
      setLoading(false);
      setError('You must be logged in to take a quiz.');
    }
  }, [quizId, token]);

  useEffect(() => {
    if (quiz?.time_limit && timeRemaining === null) {
      setTimeRemaining(quiz.time_limit * 60); // Convert minutes to seconds
    }
  }, [quiz, timeRemaining]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const fetchQuiz = async () => {
    if (!token) {
      setError('You must be logged in to view this quiz.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/quiz/${quizId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setError('Unauthorized. Please log in again.');
        router.push('/auth');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch quiz');
      }

      const data = await response.json();
      setQuiz(data.quiz);
      setError('');
    } catch (err) {
      setError('Failed to load quiz. Please try again.');
      console.error('Fetch quiz error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => new Map(prev).set(questionId, answer));
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !token) return;

    setIsSubmitting(true);
    setError('');

    try {
      const completedAt = new Date();
      const answerArray: Answer[] = quiz.questions.map((q) => ({
        question_id: q._id,
        user_answer: answers.get(q._id) || '',
        time_spent: 0,
      }));

      const response = await fetch(`/api/quiz/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          answers: answerArray,
          startedAt: startTime.toISOString(),
          completedAt: completedAt.toISOString(),
        }),
      });

      if (response.status === 401) {
        setError('Unauthorized. Please log in again.');
        router.push('/auth');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to submit quiz');
      }

      const data = await response.json();
      router.push(`/quiz/${quizId}/results?attemptId=${data.attempt._id}`);
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
      console.error('Submit quiz error:', err);
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!quiz) return 0;
    return Math.round(((currentQuestionIndex + 1) / quiz.questions.length) * 100);
  };

  if (loading) {
    return (
      <CollapsibleSidebar>
        <div className="quiz-loading">
          <Loader2 className="spinner" />
          <p>Loading quiz...</p>
        </div>
      </CollapsibleSidebar>
    );
  }

  if (error || !quiz) {
    return (
      <CollapsibleSidebar>
        <div className="quiz-error">
          <XCircle className="error-icon" />
          <p>{error || 'Quiz not found'}</p>
          {error.includes('log in') && (
            <button 
              className="btn-primary" 
              onClick={() => router.push('/auth')}
              style={{ marginTop: '1rem' }}
            >
              Go to Login
            </button>
          )}
        </div>
      </CollapsibleSidebar>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const currentAnswer = answers.get(currentQuestion._id) || '';

  return (
    <CollapsibleSidebar>
      <div className="take-quiz-page">
        {/* Header */}
        <div className="quiz-header-bar">
          <div className="quiz-info">
            <h1 className="quiz-title">{quiz.title}</h1>
            <div className="quiz-meta">
              <span className={`difficulty-badge difficulty-${quiz.difficulty}`}>
                {quiz.difficulty}
              </span>
              <span className="question-count">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>
          </div>

          {timeRemaining !== null && (
            <div className="timer">
              <Clock className="timer-icon" />
              <span className={timeRemaining < 60 ? 'timer-warning' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${getProgress()}%` }} />
          </div>
          <span className="progress-text">{getProgress()}% Complete</span>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-header">
            <span className="question-number">Question {currentQuestionIndex + 1}</span>
            <span className="question-type-badge">
              {quiz.quiz_type === 'multiple-choice' ? 'Multiple Choice' : 'Fill in the Blank'}
            </span>
          </div>

          <p className="question-text">{currentQuestion.question_text}</p>

          {/* Answer Options */}
          <div className="answer-section">
            {currentQuestion.question_type === 'multiple-choice' ? (
              <div className="options-grid">
                {currentQuestion.options?.map((option, index) => (
                  <button
                    key={index}
                    className={`option-button ${
                      currentAnswer === option ? 'selected' : ''
                    }`}
                    onClick={() => handleAnswerChange(currentQuestion._id, option)}
                  >
                    <div className="option-radio">
                      {currentAnswer === option && <div className="option-radio-selected" />}
                    </div>
                    <span className="option-text">{option}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="fill-blank-section">
                <input
                  type="text"
                  className="fill-blank-input"
                  placeholder="Type your answer here..."
                  value={currentAnswer}
                  onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="question-navigation">
            <button
              className="nav-button"
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="nav-icon" />
              Previous
            </button>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                className="submit-button"
                onClick={handleSubmitQuiz}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="nav-icon animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="nav-icon" />
                    Submit Quiz
                  </>
                )}
              </button>
            ) : (
              <button className="nav-button nav-button-primary" onClick={handleNextQuestion}>
                Next
                <ArrowRight className="nav-icon" />
              </button>
            )}
          </div>
        </div>

        {/* Question Grid */}
        <div className="question-grid-card">
          <h3 className="grid-title">Questions Overview</h3>
          <div className="question-grid">
            {quiz.questions.map((q, index) => (
              <button
                key={q._id}
                className={`grid-item ${index === currentQuestionIndex ? 'current' : ''} ${
                  answers.has(q._id) ? 'answered' : ''
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                <span>{index + 1}</span>
                {answers.has(q._id) && <CheckCircle className="answered-icon" />}
              </button>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSidebar>
  );
};

export default TakeQuizPage;
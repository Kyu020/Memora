'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import CollapsibleSidebar from '@/app/sidebar';
import { authService } from '@/services/auth.service';
import {
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Home,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import './results.css';

interface QuestionResult {
  question_text: string;
  question_type: string;
  options?: string[];
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
}

interface QuizAttempt {
  _id: string;
  quiz_id: {
    _id: string;
    title: string;
    difficulty: string;
    questions: any[];
  };
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  completed_at: string;
  answers: any[];
}

interface CurrentUser {
  name: string;
  email: string;
}

const QuizResultsPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = params.quizId as string;
  const attemptId = searchParams.get('attemptId');

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Subscribe to auth changes
  useEffect(() => {
    const currentToken = authService.getToken();
    setToken(currentToken);

    // Check if token exists, if not redirect
    if (!currentToken) {
      setError('You must be logged in to view results.');
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
      fetchResults();
    } else if (token === null) {
      // Token is explicitly null (not just uninitialized)
      setLoading(false);
      setError('You must be logged in to view results.');
    }
  }, [attemptId, token]);

  const fetchResults = async () => {
    if (!token) {
      console.error('fetchResults called without token');
      setError('You must be logged in to view results.');
      setLoading(false);
      return;
    }

    if (!attemptId) {
      setError('No attempt ID provided.');
      setLoading(false);
      return;
    }

    console.log('Fetching results for attempt:', attemptId);

    try {
      // Fetch attempt data
      const attemptResponse = await fetch(`/api/quiz/attempts/${attemptId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Results fetch response status:', attemptResponse.status);

      if (attemptResponse.status === 401) {
        console.error('401 Unauthorized - token may be invalid');
        setError('Unauthorized. Please log in again.');
        router.push('/auth');
        return;
      }

      if (!attemptResponse.ok) {
        throw new Error('Failed to fetch results');
      }

      const attemptData = await attemptResponse.json();
      console.log('Results fetched successfully');
      setAttempt(attemptData.attempt);

      // Build question results
      const results: QuestionResult[] = attemptData.attempt.quiz_id.questions.map(
        (question: any) => {
          const userAnswerData = attemptData.attempt.answers.find(
            (a: any) => a.question_id.toString() === question._id.toString()
          );

          return {
            question_text: question.question_text,
            question_type: question.question_type,
            options: question.options,
            user_answer: userAnswerData?.user_answer || '',
            correct_answer: question.correct_answer,
            is_correct: userAnswerData?.is_correct || false,
            explanation: question.explanation,
          };
        }
      );

      setQuestionResults(results);
      setError('');
    } catch (err) {
      console.error('Fetch results error:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getScoreMessage = (score: number): string => {
    if (score >= 90) return 'Outstanding! 🎉';
    if (score >= 80) return 'Great Job! 👏';
    if (score >= 70) return 'Good Work! 👍';
    if (score >= 60) return 'Not Bad! 💪';
    return 'Keep Practicing! 📚';
  };

  if (loading) {
    return (
      <CollapsibleSidebar>
        <div className="results-loading">
          <Loader2 className="spinner" />
          <p>Loading results...</p>
        </div>
      </CollapsibleSidebar>
    );
  }

  if (error || !attempt) {
    return (
      <CollapsibleSidebar>
        <div className="results-error">
          <XCircle className="error-icon" />
          <p>{error || 'Results not found'}</p>
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

  return (
    <CollapsibleSidebar>
      <div className="results-page">
        {/* Header */}
        <div className="results-header">
          <h1 className="results-title">Quiz Results</h1>
          <p className="results-subtitle">{attempt.quiz_id.title}</p>
        </div>

        {/* Score Card */}
        <div className={`score-card score-${getScoreColor(attempt.score)}`}>
          <div className="score-circle">
            <svg className="score-svg" viewBox="0 0 100 100">
              <circle
                className="score-background"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="10"
              />
              <circle
                className="score-progress"
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeWidth="10"
                strokeDasharray={`${attempt.score * 2.827} 282.7`}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="score-content">
              <div className="score-value">{attempt.score}%</div>
              <div className="score-label">Score</div>
            </div>
          </div>

          <div className="score-details">
            <h2 className="score-message">{getScoreMessage(attempt.score)}</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <CheckCircle className="stat-icon stat-icon-success" />
                <div className="stat-content">
                  <div className="stat-value">{attempt.correct_answers}</div>
                  <div className="stat-label">Correct</div>
                </div>
              </div>

              <div className="stat-item">
                <XCircle className="stat-icon stat-icon-danger" />
                <div className="stat-content">
                  <div className="stat-value">
                    {attempt.total_questions - attempt.correct_answers}
                  </div>
                  <div className="stat-label">Incorrect</div>
                </div>
              </div>

              <div className="stat-item">
                <Target className="stat-icon stat-icon-primary" />
                <div className="stat-content">
                  <div className="stat-value">{attempt.total_questions}</div>
                  <div className="stat-label">Total Questions</div>
                </div>
              </div>

              <div className="stat-item">
                <Clock className="stat-icon stat-icon-secondary" />
                <div className="stat-content">
                  <div className="stat-value">{formatTime(attempt.time_taken)}</div>
                  <div className="stat-label">Time Taken</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="action-btn btn-home" onClick={() => router.push('/dashboard')}>
            <Home className="btn-icon" />
            Back to Dashboard
          </button>
          <button className="action-btn btn-retry" onClick={() => router.push(`/quiz/${quizId}`)}>
            <RotateCcw className="btn-icon" />
            Retake Quiz
          </button>
        </div>

        {/* Question Review */}
        <div className="review-section">
          <h2 className="review-title">Question Review</h2>
          <p className="review-subtitle">Review your answers and learn from explanations</p>

          <div className="questions-list">
            {questionResults.map((result, index) => (
              <div
                key={index}
                className={`question-review-card ${
                  result.is_correct ? 'correct' : 'incorrect'
                }`}
              >
                <div className="question-review-header">
                  <span className="question-review-number">Question {index + 1}</span>
                  <div className="question-review-status">
                    {result.is_correct ? (
                      <>
                        <CheckCircle className="status-icon status-icon-success" />
                        <span className="status-text status-success">Correct</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="status-icon status-icon-danger" />
                        <span className="status-text status-danger">Incorrect</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="question-review-text">{result.question_text}</p>

                {result.question_type === 'multiple-choice' && result.options && (
                  <div className="review-options">
                    {result.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`review-option ${
                          option === result.correct_answer
                            ? 'correct-option'
                            : option === result.user_answer
                            ? 'user-option'
                            : ''
                        }`}
                      >
                        <span className="option-text">{option}</span>
                        {option === result.correct_answer && (
                          <CheckCircle className="option-icon" />
                        )}
                        {option === result.user_answer && option !== result.correct_answer && (
                          <XCircle className="option-icon" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {result.question_type === 'fill-blank' && (
                  <div className="review-answers">
                    <div className="answer-row">
                      <span className="answer-label">Your Answer:</span>
                      <span className={`answer-value ${result.is_correct ? 'correct' : 'incorrect'}`}>
                        {result.user_answer || '(No answer)'}
                      </span>
                    </div>
                    {!result.is_correct && (
                      <div className="answer-row">
                        <span className="answer-label">Correct Answer:</span>
                        <span className="answer-value correct">{result.correct_answer}</span>
                      </div>
                    )}
                  </div>
                )}

                {result.explanation && (
                  <div className="explanation-box">
                    <div className="explanation-header">
                      <TrendingUp className="explanation-icon" />
                      <span className="explanation-title">Explanation</span>
                    </div>
                    <p className="explanation-text">{result.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSidebar>
  );
};

export default QuizResultsPage;
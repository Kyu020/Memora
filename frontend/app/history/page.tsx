'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CollapsibleSidebar from '@/app/sidebar';
import { authService } from '@/services/auth.service';
import {
  Clock,
  CheckCircle,
  XCircle,
  BookOpen,
  Trophy,
  Play,
  Eye,
  Calendar,
  Target,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import './history.css';

interface Quiz {
  _id: string;
  title: string;
  difficulty: string;
  quiz_type: string;
  time_limit: number | null;
  created_at: string;
  questions?: any[]; // Optional since my-quizzes endpoint excludes this
  question_count?: number; // In case backend adds this field
}

interface Attempt {
  _id: string;
  quiz_id: {
    _id: string;
    title: string;
    difficulty: string;
  };
  score: number;
  total_questions: number;
  correct_answers: number;
  time_taken: number;
  completed_at: string;
}

interface CurrentUser {
  name: string;
  email: string;
}

const QuizHistoryPage: React.FC = () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'quizzes' | 'results'>('quizzes');

  useEffect(() => {
    const currentToken = authService.getToken();
    setToken(currentToken);

    if (!currentToken) {
      setError('You must be logged in to view your history.');
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
      fetchData();
    } else if (token === null) {
      setLoading(false);
      setError('You must be logged in to view your history.');
    }
  }, [token]);

  const fetchData = async () => {
    if (!token) {
      setError('You must be logged in to view your history.');
      setLoading(false);
      return;
    }

    try {
      // Fetch user's quizzes
      const quizzesResponse = await fetch(`${API_BASE_URL}/quiz/my-quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (quizzesResponse.status === 401) {
        setError('Unauthorized. Please log in again.');
        router.push('/auth');
        return;
      }

      if (!quizzesResponse.ok) {
        throw new Error('Failed to fetch quizzes');
      }

      const quizzesData = await quizzesResponse.json();
      console.log('Quizzes data:', quizzesData);
      setQuizzes(Array.isArray(quizzesData.quizzes) ? quizzesData.quizzes : []);

      // Fetch user's attempts
      const attemptsResponse = await fetch(`${API_BASE_URL}/quiz/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (attemptsResponse.status === 401) {
        setError('Unauthorized. Please log in again.');
        router.push('/auth');
        return;
      }

      if (!attemptsResponse.ok) {
        throw new Error('Failed to fetch attempts');
      }

      const attemptsData = await attemptsResponse.json();
      console.log('Attempts data:', attemptsData);
      setAttempts(Array.isArray(attemptsData.attempts) ? attemptsData.attempts : []);

      setError('');
    } catch (err) {
      console.error('Fetch data error:', err);
      setError('Failed to load history. Please try again.');
      // Set empty arrays on error to prevent undefined errors
      setQuizzes([]);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'easy';
      case 'medium':
        return 'medium';
      case 'hard':
        return 'hard';
      default:
        return 'medium';
    }
  };

  if (loading) {
    return (
      <CollapsibleSidebar>
        <div className="history-loading">
          <Loader2 className="spinner" />
          <p>Loading your history...</p>
        </div>
      </CollapsibleSidebar>
    );
  }

  if (error) {
    return (
      <CollapsibleSidebar>
        <div className="history-error">
          <XCircle className="error-icon" />
          <p>{error}</p>
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
      <div className="history-page">
        {/* Header */}
        <div className="history-header">
          <div className="header-content">
            <div>
              <h1 className="page-title">Quiz History</h1>
              <p className="page-subtitle">Track your progress and review past quizzes</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-primary">
                <BookOpen className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{quizzes.length}</div>
                <div className="stat-label">Total Quizzes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-success">
                <Trophy className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">{attempts.length}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-warning">
                <Target className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {attempts.length > 0
                    ? Math.round(
                        attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
                      )
                    : 0}
                  %
                </div>
                <div className="stat-label">Average Score</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper stat-icon-secondary">
                <TrendingUp className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">
                  {attempts.length > 0
                    ? Math.round(
                        (attempts.reduce((sum, a) => sum + a.correct_answers, 0) /
                          attempts.reduce((sum, a) => sum + a.total_questions, 0)) *
                          100
                      )
                    : 0}
                  %
                </div>
                <div className="stat-label">Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'quizzes' ? 'active' : ''}`}
            onClick={() => setActiveTab('quizzes')}
          >
            <BookOpen className="tab-icon" />
            My Quizzes ({quizzes.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            <Trophy className="tab-icon" />
            Results ({attempts.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === 'quizzes' ? (
          <div className="content-section">
            {quizzes.length === 0 ? (
              <div className="empty-state">
                <AlertCircle className="empty-icon" />
                <h3 className="empty-title">No Quizzes Yet</h3>
                <p className="empty-description">
                  You haven't created any quizzes yet. Start by creating your first quiz!
                </p>
                <button
                  className="btn-primary"
                  onClick={() => router.push('/quiz')}
                >
                  Create Quiz
                </button>
              </div>
            ) : (
              <div className="quizzes-grid">
                {quizzes.map((quiz) => (
                  <div key={quiz._id} className="quiz-card">
                    <div className="quiz-card-header">
                      <h3 className="quiz-card-title">{quiz.title}</h3>
                      <span
                        className={`difficulty-badge difficulty-${getDifficultyColor(
                          quiz.difficulty
                        )}`}
                      >
                        {quiz.difficulty}
                      </span>
                    </div>

                    <div className="quiz-card-meta">
                      <div className="meta-item">
                        <Target className="meta-icon" />
                        <span>{quiz.questions?.length || 0} Questions</span>
                      </div>
                      <div className="meta-item">
                        <Clock className="meta-icon" />
                        <span>
                          {quiz.time_limit ? `${quiz.time_limit} min` : 'No limit'}
                        </span>
                      </div>
                      <div className="meta-item">
                        <Calendar className="meta-icon" />
                        <span>{formatDate(quiz.created_at)}</span>
                      </div>
                    </div>

                    <div className="quiz-card-footer">
                      <span className="quiz-type-label">{quiz.quiz_type}</span>
                      <button
                        className="btn-play-quiz"
                        onClick={() => router.push(`/quiz/${quiz._id}`)}
                      >
                        <Play className="btn-icon" />
                        Take Quiz
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="content-section">
            {attempts.length === 0 ? (
              <div className="empty-state">
                <AlertCircle className="empty-icon" />
                <h3 className="empty-title">No Results Yet</h3>
                <p className="empty-description">
                  You haven't completed any quizzes yet. Take a quiz to see your results here!
                </p>
                <button
                  className="btn-primary"
                  onClick={() => setActiveTab('quizzes')}
                >
                  View Quizzes
                </button>
              </div>
            ) : (
              <div className="results-list">
                {attempts.map((attempt) => (
                  <div key={attempt._id} className="result-card">
                    <div className="result-card-content">
                      <div className="result-info">
                        <h3 className="result-title">{attempt.quiz_id.title}</h3>
                        <div className="result-meta">
                          <span
                            className={`difficulty-badge difficulty-${getDifficultyColor(
                              attempt.quiz_id.difficulty
                            )}`}
                          >
                            {attempt.quiz_id.difficulty}
                          </span>
                          <div className="meta-item">
                            <Calendar className="meta-icon" />
                            <span>{formatDate(attempt.completed_at)}</span>
                          </div>
                          <div className="meta-item">
                            <Clock className="meta-icon" />
                            <span>{formatTime(attempt.time_taken)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="result-stats">
                        <div className={`score-circle score-${getScoreColor(attempt.score)}`}>
                          <span className="score-value">{attempt.score}%</span>
                        </div>
                        <div className="result-details">
                          <div className="detail-item">
                            <CheckCircle className="detail-icon detail-icon-success" />
                            <span>
                              {attempt.correct_answers}/{attempt.total_questions} Correct
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn-view-results"
                      onClick={() =>
                        router.push(
                          `/quiz/${attempt.quiz_id._id}/results?attemptId=${attempt._id}`
                        )
                      }
                    >
                      <Eye className="btn-icon" />
                      View Results
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </CollapsibleSidebar>
  );
};

export default QuizHistoryPage;

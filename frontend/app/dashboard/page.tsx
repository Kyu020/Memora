'use client';

import { useEffect, useState } from 'react';
import CollapsibleSidebar from '@/app/sidebar';
import { authService } from '@/services/auth.service';
import { 
  Award, 
  Clock, 
  TrendingUp, 
  HelpCircle, 
  MessageSquare, 
  BarChart2, 
  User,
  CheckCircle,
  Book,
  ChevronRight,
  BookOpen,
  Upload,
  Target,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import './dashboard.css';

interface UserData {
  username: string;
  email: string;
}

interface DashboardStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  accuracy: number;
  recentQuizScore: {
    score: number;
    title: string;
    completedAt: string;
    percentageChange: number;
  } | null;
  recentActivities: Array<{
    type: string;
    title: string;
    description: string;
    timestamp: string;
    icon: string;
  }>;
}

export default function DashboardPage() {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const [user, setUser] = useState<UserData | null>(null);
  const [greeting, setGreeting] = useState('Welcome back');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Subscribe to user changes
    const unsubscribe = authService.subscribe((userData) => {
      setUser(userData);
    });

    // Initialize user immediately
    const currentUser = authService.getUser();
    if (currentUser) setUser(currentUser);

    // Greeting logic
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('${API_BASE_URL}/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      setStats(data);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (iconName: string) => {
    const icons: { [key: string]: any } = {
      CheckCircle,
      MessageSquare,
      Book,
      Upload,
      Award
    };
    return icons[iconName] || Book;
  };

  return (
    <CollapsibleSidebar>
      <div className="dashboard-page">
        {/* Header Section */}
        <div className="dashboard-header">
          <div className="header-content">
            <div>
              <h1 className="dashboard-title">
                {greeting}, {user?.username || 'User'}!
              </h1>
              <p className="dashboard-subtitle">
                Here's your personalized learning dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        )}

        {/* Stats Cards */}
        {!loading && stats && (
          <>
            <div className="stats-grid">
              {/* Total Quizzes */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3 className="stat-card-title">Total Quizzes</h3>
                  <div className="stat-icon stat-icon-primary">
                    <BookOpen size={20} />
                  </div>
                </div>
                <div className="stat-card-value">
                  <div className="stat-main">
                    <span className="stat-number">{stats.totalQuizzes}</span>
                  </div>
                </div>
                <p className="stat-description">Quizzes created</p>
              </div>

              {/* Completed Quizzes */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3 className="stat-card-title">Completed</h3>
                  <div className="stat-icon stat-icon-secondary">
                    <Trophy size={20} />
                  </div>
                </div>
                <div className="stat-card-value">
                  <div className="stat-main">
                    <span className="stat-number">{stats.completedQuizzes}</span>
                  </div>
                </div>
                <p className="stat-description">Quizzes finished</p>
              </div>

              {/* Average Score */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3 className="stat-card-title">Average Score</h3>
                  <div className="stat-icon stat-icon-accent">
                    <Target size={20} />
                  </div>
                </div>
                <div className="stat-card-value">
                  <div className="stat-main">
                    <span className="stat-number">{stats.averageScore}%</span>
                  </div>
                </div>
                <p className="stat-description">Overall performance</p>
              </div>

              {/* Accuracy */}
              <div className="stat-card">
                <div className="stat-card-header">
                  <h3 className="stat-card-title">Accuracy</h3>
                  <div className="stat-icon stat-icon-purple">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <div className="stat-card-value">
                  <div className="stat-main">
                    <span className="stat-number">{stats.accuracy}%</span>
                  </div>
                </div>
                <p className="stat-description">Correct answers rate</p>
              </div>
            </div>

            {/* Recent Quiz Score Banner */}
            {stats.recentQuizScore && (
              <div className="recent-quiz-banner">
                <div className="banner-content">
                  <Award className="banner-icon" size={32} />
                  <div className="banner-text">
                    <h3>Latest Quiz Result</h3>
                    <p>{stats.recentQuizScore.title}</p>
                  </div>
                </div>
                <div className="banner-score">
                  <span className="score-value">{stats.recentQuizScore.score}%</span>
                  {stats.recentQuizScore.percentageChange !== 0 && (
                    <span className={`score-change ${stats.recentQuizScore.percentageChange > 0 ? 'positive' : 'negative'}`}>
                      {stats.recentQuizScore.percentageChange > 0 ? '+' : ''}{stats.recentQuizScore.percentageChange}%
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions & Recent Activity */}
            <div className="content-grid">
              {/* Quick Actions */}
              <div className="content-card">
                <h3 className="content-card-title">Quick Actions</h3>
                <div className="action-grid">
                  <Link href="/quiz" className="action-card">
                    <div className="action-icon action-icon-gradient-1">
                      <HelpCircle size={20} />
                    </div>
                    <p className="action-label">Start Quiz</p>
                  </Link>

                  <Link href="/chat" className="action-card">
                    <div className="action-icon action-icon-gradient-2">
                      <MessageSquare size={20} />
                    </div>
                    <p className="action-label">Ask AI Tutor</p>
                  </Link>

                  <Link href="/history" className="action-card">
                    <div className="action-icon action-icon-gradient-3">
                      <BarChart2 size={20} />
                    </div>
                    <p className="action-label">View Progress</p>
                  </Link>

                  <Link href="/profile" className="action-card">
                    <div className="action-icon action-icon-gradient-4">
                      <User size={20} />
                    </div>
                    <p className="action-label">Profile Settings</p>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="content-card">
                <h3 className="content-card-title">Recent Activity</h3>
                {stats.recentActivities.length > 0 ? (
                  <>
                    <div className="activity-list">
                      {stats.recentActivities.slice(0, 5).map((activity, index) => {
                        const IconComponent = getActivityIcon(activity.icon);
                        return (
                          <div key={index} className="activity-item">
                            <div className={`activity-icon activity-icon-${['primary', 'secondary', 'accent', 'purple'][index % 4]}`}>
                              <IconComponent size={20} />
                            </div>
                            <div className="activity-content">
                              <p className="activity-title">{activity.title}</p>
                              <p className="activity-meta">{activity.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {stats.recentActivities.length > 5 && (
                      <Link href="/history" className="view-all-link">
                        View all activity
                        <ChevronRight size={16} />
                      </Link>
                    )}
                  </>
                ) : (
                  <div className="empty-state">
                    <Clock size={48} className="empty-icon" />
                    <p className="empty-text">No recent activity</p>
                    <p className="empty-subtext">Start a quiz or chat with AI to see your activity here</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </CollapsibleSidebar>
  );
}

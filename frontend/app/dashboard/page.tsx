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
  Star,
  ChevronRight,
  BookOpen,
  Clipboard,
  ArrowUp
} from 'lucide-react';
import Link from 'next/link';
import './dashboard.css';

interface UserData {
  username: string;
  email: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [greeting, setGreeting] = useState('Welcome back');

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

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

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

        {/* Stats Cards */}
        <div className="stats-grid">
          {/* Recent Quiz Score */}
          <div className="stat-card">
            <div className="stat-card-header">
              <h3 className="stat-card-title">Recent Quiz Score</h3>
              <div className="stat-icon stat-icon-primary">
                <Award size={20} />
              </div>
            </div>
            <div className="stat-card-value">
              <div className="stat-main">
                <span className="stat-number">87%</span>
                <span className="stat-change stat-change-positive">
                  <ArrowUp size={16} />
                  12%
                </span>
              </div>
            </div>
            <p className="stat-description">Biology: Cellular Structures</p>
          </div>

          {/* Study Time */}
          <div className="stat-card">
            <div className="stat-card-header">
              <h3 className="stat-card-title">Study Time</h3>
              <div className="stat-icon stat-icon-secondary">
                <Clock size={20} />
              </div>
            </div>
            <div className="stat-card-value">
              <div className="stat-main">
                <span className="stat-number">8.5</span>
                <span className="stat-unit">hours this week</span>
              </div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '70%' }}></div>
            </div>
          </div>

          {/* Progress Level */}
          <div className="stat-card">
            <div className="stat-card-header">
              <h3 className="stat-card-title">Progress Level</h3>
              <div className="stat-icon stat-icon-accent">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="stat-card-value">
              <div className="stat-main">
                <span className="stat-text">Advanced</span>
                <span className="stat-badge">
                  <Star size={16} />
                  85% complete
                </span>
              </div>
            </div>
            <p className="stat-description">Current focus: Organic Chemistry</p>
          </div>
        </div>

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
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon activity-icon-primary">
                  <CheckCircle size={20} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Completed Quiz: Biology</p>
                  <p className="activity-meta">Score: 87% | 30 minutes ago</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon activity-icon-secondary">
                  <MessageSquare size={20} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Asked AI about Photosynthesis</p>
                  <p className="activity-meta">1 hour ago</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon activity-icon-accent">
                  <Book size={20} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Studied Organic Chemistry</p>
                  <p className="activity-meta">2 hours ago | 45 minutes</p>
                </div>
              </div>

              <div className="activity-item">
                <div className="activity-icon activity-icon-purple">
                  <Award size={20} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">Achievement Unlocked: Quick Learner</p>
                  <p className="activity-meta">Yesterday</p>
                </div>
              </div>
            </div>

            <Link href="/progress" className="view-all-link">
              View all activity
              <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Recommended Topics */}
        {/* <div className="content-card recommended-topics">
          <div className="content-card-header">
            <h3 className="content-card-title">Recommended Topics</h3>
            <Link href="/quiz-generator" className="view-all-link">
              Start new quiz
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className="topics-grid">
            <Link href="/quiz?topic=biochemistry" className="topic-card">
              <p className="topic-title">Biochemistry Basics</p>
              <p className="topic-meta">8 questions</p>
            </Link>

            <Link href="/quiz?topic=organic-chem" className="topic-card">
              <p className="topic-title">Organic Chemistry</p>
              <p className="topic-meta">12 questions</p>
            </Link>

            <Link href="/quiz?topic=cell-biology" className="topic-card">
              <p className="topic-title">Cell Biology</p>
              <p className="topic-meta">10 questions</p>
            </Link>

            <Link href="/quiz?topic=genetics" className="topic-card">
              <p className="topic-title">Genetics Review</p>
              <p className="topic-meta">15 questions</p>
            </Link>
          </div>
        </div> */}

        {/* Upcoming Study Plan
        <div className="content-card study-plan">
          <h3 className="content-card-title">Upcoming Study Plan</h3>

          <div className="study-plan-list">
            <div className="study-plan-item study-plan-item-blue">
              <div className="study-plan-content">
                <div className="study-plan-icon">
                  <BookOpen size={20} />
                </div>
                <div>
                  <p className="study-plan-title">Chemistry: Reaction Mechanisms</p>
                  <p className="study-plan-meta">Scheduled for tomorrow</p>
                </div>
              </div>
              <button className="study-plan-button">Start Now</button>
            </div>

            <div className="study-plan-item study-plan-item-purple">
              <div className="study-plan-content">
                <div className="study-plan-icon">
                  <Clipboard size={20} />
                </div>
                <div>
                  <p className="study-plan-title">Biology: Genetics Quiz</p>
                  <p className="study-plan-meta">Due in 2 days</p>
                </div>
              </div>
              <button className="study-plan-button">Prepare</button>
            </div>
          </div>
        </div> */}
      </div>
    </CollapsibleSidebar>
  );
}
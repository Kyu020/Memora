'use client';

import React, { useState, useEffect, ChangeEvent, DragEvent } from 'react';
import { useRouter } from 'next/navigation';
import CollapsibleSidebar from '@/app/sidebar';
import { Upload, FileText, Play, CheckSquare, Edit, Zap, Loader2 } from 'lucide-react';
import { authService } from '@/services/auth.service';
import './quiz.css';

interface UploadedFile {
  _id: string;
  original_name: string;
  createdAt: string;
  file_type: string;
}

interface CurrentUser {
  name: string;
  email: string;
}

const QuizPage: React.FC = () => {
  const router = useRouter();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFileIds, setUploadedFileIds] = useState<string[]>([]);
  const [recentUploads, setRecentUploads] = useState<UploadedFile[]>([]);
  const [quizType, setQuizType] = useState<string>('multiple-choice');
  const [numQuestions, setNumQuestions] = useState<string>('10');
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [timeLimit, setTimeLimit] = useState<string>('none');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Subscribe to auth changes
  useEffect(() => {
    setToken(authService.getToken());

    const unsubscribe = authService.subscribe((u) => {
      if (u) setUser({ name: u.username, email: u.email });
      else setUser(null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (token) fetchRecentFiles();
  }, [token]);

  const fetchRecentFiles = async () => {
    if (!token) {
      setError('You must be logged in to view recent files.');
      return;
    }

    try {
      const response = await fetch('/api/quiz/files/recent', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        setError('Unauthorized. Please log in again.');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setRecentUploads(data.files);
      } else {
        setError('Failed to fetch recent files.');
      }
    } catch (err) {
      console.error('Failed to fetch recent files:', err);
      setError('Error fetching recent files.');
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) handleFiles(e.target.files);
  };

  const handleFiles = async (files: FileList) => {
    if (!token) {
      setError('You must be logged in to upload files.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));

      const response = await fetch('/api/quiz/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        setError('Unauthorized. Please log in again.');
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to upload files');
      }

      const data = await response.json();
      const fileIds = data.files.map((f: UploadedFile) => f._id);

      setUploadedFileIds((prev) => [...prev, ...fileIds]);
      setSelectedFiles((prev) => [...prev, ...Array.from(files)]);

      fetchRecentFiles();

      alert(`Successfully uploaded ${files.length} file(s)`);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload files.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUseRecentFile = (fileId: string) => {
    if (!uploadedFileIds.includes(fileId)) {
      setUploadedFileIds((prev) => [...prev, fileId]);
      alert('File added to quiz generation queue');
    } else {
      alert('File already selected');
    }
  };

  const handleGenerateQuiz = async () => {
    if (!token) {
      setError('You must be logged in to generate a quiz.');
      return;
    }

    if (uploadedFileIds.length === 0) {
      setError('Please upload or select at least one file.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileIds: uploadedFileIds,
          quizType,
          numQuestions,
          difficulty,
          timeLimit,
        }),
      });

      if (response.status === 401) {
        setError('Unauthorized. Please log in again.');
        return;
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate quiz');
      }

      const data = await response.json();
      const quizId = data.quizId;

      const checkStatus = async () => {
        const statusResponse = await fetch(`/api/quiz/${quizId}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const statusData = await statusResponse.json();

        if (statusData.status === 'completed') {
          router.push(`/quiz/${quizId}`);
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Quiz generation failed');
        } else {
          setTimeout(checkStatus, 2000);
        }
      };

      checkStatus();
    } catch (err) {
      console.error('Generate quiz error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate quiz.');
      setIsGenerating(false);
    }
  };

  const getFileIcon = (fileType: string) => {
    const colors: { [key: string]: string } = {
      '.pdf': 'blue',
      '.docx': 'purple',
      '.pptx': 'accent',
      '.txt': 'secondary',
    };
    return colors[fileType] || 'blue';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <CollapsibleSidebar>
      <div className="quiz-page">
        {/* Header */}
        <div className="quiz-header">
          <div className="header-content">
            <div className="header-text">
              <h1 className="page-title">Quiz Generator</h1>
              <p className="page-subtitle">
                Create personalized quizzes from your study materials
              </p>
            </div>
          </div>
        </div>

        {error && <div className="error-message"><p>{error}</p></div>}

        {/* Upload Section */}
        <div className="card upload-card">
          <h3 className="card-title">Upload Study Materials</h3>
          <p className="card-description">
            Upload your notes, textbooks, or presentations to generate a customized quiz
          </p>

          <div
            className={`upload-area ${isDragging ? 'upload-area-active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => {
              if (!token) return setError('Please log in to upload files.');
              const input = document.getElementById('fileInput');
              if (input) input.click();
            }}
          >
            <div className="upload-icon-wrapper">
              {isUploading ? <Loader2 className="upload-icon animate-spin" /> : <Upload className="upload-icon" />}
            </div>
            <h4 className="upload-title">{isUploading ? 'Uploading...' : 'Drag & drop files here'}</h4>
            <p className="upload-subtitle">Supports PDF, DOCX, PPTX, and TXT files (Max 10MB)</p>
            <button className="btn-upload" disabled={isUploading || !token}>
              {isUploading ? 'Uploading...' : 'Select Files'}
            </button>
            <input
              id="fileInput"
              type="file"
              multiple
              accept=".pdf,.docx,.pptx,.txt"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* Recent Uploads */}
          {recentUploads.length > 0 && (
            <div className="recent-uploads">
              <h4 className="recent-uploads-title">Recent Uploads</h4>
              <div className="uploads-grid">
                {recentUploads.map((file) => (
                  <div key={file._id} className="upload-item">
                    <div className={`upload-item-icon icon-${getFileIcon(file.file_type)}`}>
                      <FileText className="icon" />
                    </div>
                    <div className="upload-item-info">
                      <p className="upload-item-name">{file.original_name}</p>
                      <p className="upload-item-date">Uploaded {formatDate(file.createdAt)}</p>
                    </div>
                    <button
                      className="btn-play"
                      onClick={() => {
                        if (!token) return setError('Please log in to select files.');
                        handleUseRecentFile(file._id);
                      }}
                    >
                      <Play className="icon-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quiz Settings Section */}
        <div className="card settings-card">
          <h3 className="card-title">Quiz Settings</h3>
          <div className="settings-grid">
            <div className="setting-group">
              <label className="setting-label">Quiz Type</label>
              <div className="quiz-type-grid">
                <button className={`quiz-type-btn ${quizType === 'multiple-choice' ? 'active' : ''}`} onClick={() => setQuizType('multiple-choice')}>
                  <CheckSquare className="quiz-type-icon" />
                  <span className="quiz-type-text">Multiple Choice</span>
                </button>
                <button className={`quiz-type-btn ${quizType === 'fill-blank' ? 'active' : ''}`} onClick={() => setQuizType('fill-blank')}>
                  <Edit className="quiz-type-icon" />
                  <span className="quiz-type-text">Fill in Blanks</span>
                </button>
              </div>
            </div>

            <div className="setting-group">
              <label className="setting-label">Number of Questions</label>
              <select className="setting-select" value={numQuestions} onChange={(e) => setNumQuestions(e.target.value)}>
                <option value="5">5 Questions</option>
                <option value="10">10 Questions</option>
                <option value="15">15 Questions</option>
                <option value="20">20 Questions</option>
              </select>
            </div>

            <div className="setting-group">
              <label className="setting-label">Difficulty Level</label>
              <select className="setting-select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="setting-group">
              <label className="setting-label">Time Limit (optional)</label>
              <select className="setting-select" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)}>
                <option value="none">No time limit</option>
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
              </select>
            </div>
          </div>

          <div className="settings-footer">
            <button
              className="btn-generate"
              onClick={handleGenerateQuiz}
              disabled={isGenerating || uploadedFileIds.length === 0 || !token}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="btn-icon animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="btn-icon" />
                  Generate Quiz
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </CollapsibleSidebar>
  );
};

export default QuizPage;

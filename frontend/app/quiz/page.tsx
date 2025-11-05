'use client';

import React, { useState } from 'react';
import CollapsibleSidebar from '@/app/sidebar';
import { Upload, FileText, Play, CheckSquare, Edit, Zap } from 'lucide-react';
import './quiz.css';

const QuizPage = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [quizType, setQuizType] = useState('multiple-choice');
  const [numQuestions, setNumQuestions] = useState('10');
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimit, setTimeLimit] = useState('none');
  const [isDragging, setIsDragging] = useState(false);

  const recentUploads = [
    {
      id: 1,
      name: 'History_Notes.pdf',
      uploadDate: '2 days ago',
      icon: 'pdf',
      color: 'blue'
    },
    {
      id: 2,
      name: 'Biology_Chapter3.docx',
      uploadDate: '1 week ago',
      icon: 'doc',
      color: 'purple'
    }
  ];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    setSelectedFiles(prev => [...prev, ...fileArray]);
    alert(`Selected ${files.length} file(s) for upload`);
  };

  const handleGenerateQuiz = () => {
    const settings = {
      type: quizType,
      questions: numQuestions,
      difficulty: difficulty,
      timeLimit: timeLimit
    };
    console.log('Generating quiz with settings:', settings);
    alert('Quiz generation started! This would typically process your uploaded files.');
  };

  return (
    <CollapsibleSidebar>
    <div className="quiz-page">
      {/* Header */}
      <div className="quiz-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="page-title">Quiz Generator</h1>
            <p className="page-subtitle">Create personalized quizzes from your study materials</p>
          </div>
        </div>
      </div>

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
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div className="upload-icon-wrapper">
            <Upload className="upload-icon" />
          </div>
          <h4 className="upload-title">Drag & drop files here</h4>
          <p className="upload-subtitle">
            Supports PDF, DOCX, PPTX, and TXT files (Max 10MB)
          </p>
          <button className="btn-upload">Select Files</button>
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
        <div className="recent-uploads">
          <h4 className="recent-uploads-title">Recent Uploads</h4>
          <div className="uploads-grid">
            {recentUploads.map((file) => (
              <div key={file.id} className="upload-item">
                <div className={`upload-item-icon icon-${file.color}`}>
                  <FileText className="icon" />
                </div>
                <div className="upload-item-info">
                  <p className="upload-item-name">{file.name}</p>
                  <p className="upload-item-date">Uploaded {file.uploadDate}</p>
                </div>
                <button className="btn-play">
                  <Play className="icon-sm" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Settings Section */}
      <div className="card settings-card">
        <h3 className="card-title">Quiz Settings</h3>

        <div className="settings-grid">
          {/* Quiz Type */}
          <div className="setting-group">
            <label className="setting-label">Quiz Type</label>
            <div className="quiz-type-grid">
              <button
                className={`quiz-type-btn ${quizType === 'multiple-choice' ? 'active' : ''}`}
                onClick={() => setQuizType('multiple-choice')}
              >
                <CheckSquare className="quiz-type-icon" />
                <span className="quiz-type-text">Multiple Choice</span>
              </button>
              <button
                className={`quiz-type-btn ${quizType === 'fill-blank' ? 'active' : ''}`}
                onClick={() => setQuizType('fill-blank')}
              >
                <Edit className="quiz-type-icon" />
                <span className="quiz-type-text">Fill in Blanks</span>
              </button>
            </div>
          </div>

          {/* Number of Questions */}
          <div className="setting-group">
            <label className="setting-label">Number of Questions</label>
            <select
              className="setting-select"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
            >
              <option value="5">5 Questions</option>
              <option value="10">10 Questions</option>
              <option value="15">15 Questions</option>
              <option value="20">20 Questions</option>
            </select>
          </div>

          {/* Difficulty Level */}
          <div className="setting-group">
            <label className="setting-label">Difficulty Level</label>
            <select
              className="setting-select"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Time Limit */}
          <div className="setting-group">
            <label className="setting-label">Time Limit (optional)</label>
            <select
              className="setting-select"
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
            >
              <option value="none">No time limit</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
            </select>
          </div>
        </div>

        <div className="settings-footer">
          <button className="btn-generate" onClick={handleGenerateQuiz}>
            <Zap className="btn-icon" />
            Generate Quiz
          </button>
        </div>
      </div>
    </div>
    </CollapsibleSidebar>
  );
};

export default QuizPage;
// routes/quiz.js

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const quizController = require('../controllers/quizController');
const authMiddleware = require('../middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, PPTX, and TXT files are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Protected routes
router.use(authMiddleware);

// File upload
router.post('/upload', upload.array('files', 10), quizController.uploadFiles);

// Get recent files
router.get('/files/recent', quizController.getRecentFiles);

// Generate quiz
router.post('/generate', quizController.generateQuiz);

// Get quiz status
router.get('/:quizId/status', quizController.getQuizStatus);

// Get user's quizzes
router.get('/my-quizzes', quizController.getUserQuizzes);

// Get user's quiz history
router.get('/history', quizController.getUserQuizHistory);

// Submit quiz attempt
router.post('/:quizId/submit', quizController.submitQuizAttempt);

// ✅ Move attempt route BEFORE the dynamic quizId route
router.get('/attempts/:attemptId', quizController.getQuizAttempt);

// Finally, get single quiz (must be last)
router.get('/:quizId', quizController.getQuiz);

module.exports = router;

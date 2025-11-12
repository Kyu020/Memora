// models/QuizAttempt.js

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  user_answer: {
    type: String,
    required: true,
  },
  is_correct: {
    type: Boolean,
    required: true,
  },
  time_spent: {
    type: Number, // in seconds
    default: 0,
  },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    total_questions: {
      type: Number,
      required: true,
    },
    correct_answers: {
      type: Number,
      required: true,
    },
    time_taken: {
      type: Number, // in seconds
      required: true,
    },
    started_at: {
      type: Date,
      required: true,
    },
    completed_at: {
      type: Date,
      required: true,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's quiz attempts
quizAttemptSchema.index({ user_id: 1, quiz_id: 1, createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
// models/UploadedFile.js

const mongoose = require('mongoose');

const uploadedFileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    original_name: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
      unique: true,
    },
    file_path: {
      type: String,
      required: true,
    },
    file_type: {
      type: String,
      required: true,
    },
    file_size: {
      type: Number,
      required: true,
    },
    mime_type: {
      type: String,
      required: true,
    },
    extracted_text: {
      type: String,
      default: null,
    },
    is_processed: {
      type: Boolean,
      default: false,
    },
    processing_error: {
      type: String,
      default: null,
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

// Index for efficient queries
uploadedFileSchema.index({ user_id: 1, createdAt: -1 });
uploadedFileSchema.index({ is_processed: 1 });

module.exports = mongoose.model('UploadedFile', uploadedFileSchema);
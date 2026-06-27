const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  responses: [{
    questionId: {
      type: Number,
      required: true
    },
    answer: {
      type: Number,
      min: 0,
      max: 4,
      required: true
    }
  }],
  totalScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  stressLevel: {
    type: String,
    enum: ['low', 'moderate', 'high', 'critical'],
    required: true
  },
  recommendations: [String],
  metadata: {
    timeSpent: Number, // in seconds
    completedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { 
  timestamps: true 
});

// Index for faster queries
assessmentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);

import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  videoId: {
    type: String,
    required: true,
    unique: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes for better query performance
videoSchema.index({ createdAt: -1 }); // For sorting by newest first
videoSchema.index({ title: 'text' }); // For text search
videoSchema.index({ category: 1 }); // For filtering by category

const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

export default Video;

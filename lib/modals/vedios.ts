// models/Video.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVideo extends Document {
  title: string;
  category: mongoose.Types.ObjectId; // Reference to Category
  streamtapeId: string;
  link: string;
  thumbnail?: string; // Optional, can be fetched from Streamtape API
  likes: number;
  views: number;
}

const VideoSchema: Schema<IVideo> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    streamtapeId: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: false, // Optional, fetch from Streamtape if needed
    },
    likes: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Video: Model<IVideo> =
  mongoose.models.Video || mongoose.model<IVideo>("Video", VideoSchema);

export default Video;

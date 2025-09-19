import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  duration?: number;
  resource_type: string;
}

interface UploadResponse {
  url: string;
  publicId?: string;
  duration?: number;
}

interface VideoProvider {
  uploadVideo: (file: File | Buffer) => Promise<UploadResponse>;
  uploadThumbnail: (file: File | Buffer) => Promise<UploadResponse>;
  deleteMedia: (publicId: string) => Promise<void>;
}

class CloudinaryProvider implements VideoProvider {
  async uploadVideo(file: File | Buffer): Promise<UploadResponse> {
    try {
      // Use upload_stream for large files to avoid memory issues with base64
      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Upload timeout after 5 minutes'));
        }, 300000); // 5 minutes timeout

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'videos',
            chunk_size: 6000000, // 6MB chunks for better performance
            timeout: 300000,
          },
          (error, result) => {
            clearTimeout(timeout);
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result as CloudinaryUploadResult);
            }
          }
        );

        // Handle file conversion and streaming
        if (file instanceof File) {
          file.arrayBuffer().then(arrayBuffer => {
            const buffer = Buffer.from(arrayBuffer);
            const stream = require('stream').Readable.from(buffer);
            stream.pipe(uploadStream);
          }).catch(err => {
            clearTimeout(timeout);
            reject(err);
          });
        } else {
          const stream = require('stream').Readable.from(file);
          stream.pipe(uploadStream);
        }
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
        duration: Math.round(result.duration || 0)
      };
    } catch (error) {
      console.error('Error uploading video to Cloudinary:', error);
      throw new Error(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async uploadThumbnail(file: File | Buffer): Promise<UploadResponse> {
    try {
      let buffer: Buffer;

      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
      } else {
        buffer = file;
      }

      const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Thumbnail upload timeout'));
        }, 120000); // 2 minutes timeout

        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'thumbnails',
            timeout: 120000, // 2 minutes
          },
          (error, result) => {
            clearTimeout(timeout);
            if (error) reject(error);
            else resolve(result as CloudinaryUploadResult);
          }
        ).end(buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Error uploading thumbnail to Cloudinary:', error);
      throw new Error(`Thumbnail upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteMedia(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting media from Cloudinary:', error);
      throw new Error(`Media deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

interface BunnyVideoResponse {
  guid: string;
  title: string;
}

class BunnyNetProvider implements VideoProvider {
  private apiKey: string;
  private libraryId: string;

  constructor() {
    this.apiKey = process.env.BUNNY_API_KEY || '';
    this.libraryId = process.env.BUNNY_LIBRARY_ID || '';
  }

  async uploadVideo(file: File | Buffer): Promise<UploadResponse> {
    try {
      let buffer: Buffer;
      let filename: string;

      if (file instanceof File) {
        buffer = Buffer.from(await file.arrayBuffer());
        filename = file.name;
      } else {
        buffer = file;
        filename = 'video-' + Date.now();
      }

      // Create video in Bunny.net library with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

      const createRes = await fetch(
        `https://video.bunnycdn.com/library/${this.libraryId}/videos`,
        {
          method: 'POST',
          headers: {
            'AccessKey': this.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ title: filename }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!createRes.ok) {
        throw new Error('Failed to create video in Bunny.net');
      }

      const { guid: videoId } = await createRes.json() as BunnyVideoResponse;

      // Upload the video file with timeout
      const uploadController = new AbortController();
      const uploadTimeoutId = setTimeout(() => uploadController.abort(), 300000); // 5 minutes

      const uploadRes = await fetch(
        `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`,
        {
          method: 'PUT',
          headers: {
            'AccessKey': this.apiKey,
          },
          body: buffer.toString('base64'),
          signal: uploadController.signal
        }
      );

      clearTimeout(uploadTimeoutId);

      if (!uploadRes.ok) {
        throw new Error('Failed to upload video to Bunny.net');
      }

      return {
        url: `https://video.bunnycdn.com/play/${videoId}`,
        publicId: videoId
      };
    } catch (error) {
      console.error('Error uploading video to Bunny.net:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Upload timeout');
      }
      throw new Error(`Video upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // For Bunny.net, we'll still use Cloudinary for thumbnails
  async uploadThumbnail(file: any): Promise<UploadResponse> {
    const cloudinaryProvider = new CloudinaryProvider();
    return cloudinaryProvider.uploadThumbnail(file);
  }

  async deleteMedia(videoId: string): Promise<void> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

      const res = await fetch(
        `https://video.bunnycdn.com/library/${this.libraryId}/videos/${videoId}`,
        {
          method: 'DELETE',
          headers: {
            'AccessKey': this.apiKey,
          },
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error('Failed to delete video from Bunny.net');
      }
    } catch (error) {
      console.error('Error deleting video from Bunny.net:', error);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Delete timeout');
      }
      throw new Error(`Media deletion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export function getVideoProvider(): VideoProvider {
  const provider = process.env.VIDEO_PROVIDER || 'cloudinary';
  return provider === 'bunny' ? new BunnyNetProvider() : new CloudinaryProvider();
}

export type { UploadResponse, VideoProvider };

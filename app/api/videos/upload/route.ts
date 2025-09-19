import { NextResponse } from 'next/server';
import { getVideoProvider } from '@/lib/services/media';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('video') as File | null;
    const thumbnailFile = formData.get('thumbnail') as File | null;
    
    if (!videoFile) {
      return NextResponse.json(
        { message: 'No video file provided' },
        { status: 400 }
      );
    }

    const videoProvider = getVideoProvider();

    // Upload video
    const videoResult = await videoProvider.uploadVideo(videoFile);

    // Upload thumbnail if provided
    let thumbnailResult;
    if (thumbnailFile) {
      thumbnailResult = await videoProvider.uploadThumbnail(thumbnailFile);
    }

    return NextResponse.json({
      videoId: videoResult.publicId,
      videoUrl: videoResult.url,
      duration: videoResult.duration,
      thumbnailUrl: thumbnailResult?.url,
      thumbnailId: thumbnailResult?.publicId
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

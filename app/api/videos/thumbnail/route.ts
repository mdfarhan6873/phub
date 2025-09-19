import { NextResponse } from 'next/server';
import { getVideoProvider } from '@/lib/services/media';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const thumbnailFile = formData.get('thumbnail') as File | null;
    const videoId = formData.get('videoId') as string | null;

    if (!thumbnailFile) {
      return NextResponse.json(
        { message: 'No thumbnail file provided' },
        { status: 400 }
      );
    }

    const videoProvider = getVideoProvider();

    // Upload thumbnail
    const thumbnailResult = await videoProvider.uploadThumbnail(thumbnailFile);

    return NextResponse.json({
      thumbnailUrl: thumbnailResult.url,
      thumbnailId: thumbnailResult.publicId,
      videoId
    });
  } catch (error: any) {
    console.error('Error uploading thumbnail:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Video from "@/lib/modals/vedios";

const STREAMTAPE_LOGIN = process.env.STREAMTAPE_LOGIN;
const STREAMTAPE_KEY = process.env.STREAMTAPE_KEY;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    if (!STREAMTAPE_LOGIN || !STREAMTAPE_KEY) {
      return NextResponse.json({ error: "Streamtape credentials not configured" }, { status: 500 });
    }

    const { id } = await params;

    // Find the video by ID
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    console.log(`Retrieving thumbnail for video: ${video.streamtapeId}`);

    // Try to get thumbnail with retry logic (same as update-thumbnails)
    let thumbnailUrl = "";
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const thumbnailResponse = await fetch(`https://api.streamtape.com/file/getsplash?login=${STREAMTAPE_LOGIN}&key=${STREAMTAPE_KEY}&file=${video.streamtapeId}`);
        const thumbnailData = await thumbnailResponse.json();

        if (thumbnailData.status === 200) {
          thumbnailUrl = thumbnailData.result;
          break;
        } else {
          console.warn(`Failed to get thumbnail for ${video.streamtapeId} (attempt ${attempt}):`, thumbnailData.msg);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      } catch (error) {
        console.error(`Error fetching thumbnail for ${video.streamtapeId}:`, error);
      }
    }

    if (thumbnailUrl) {
      video.thumbnail = thumbnailUrl;
      await video.save();
      console.log(`Updated thumbnail for video ${video.streamtapeId}: ${thumbnailUrl}`);
      return NextResponse.json({
        message: "Thumbnail retrieved successfully",
        thumbnail: thumbnailUrl
      });
    } else {
      return NextResponse.json({
        error: "Could not retrieve thumbnail - it may not be available yet"
      }, { status: 404 });
    }

  } catch (error) {
    console.error("Error retrieving thumbnail:", error);
    return NextResponse.json({ error: "Failed to retrieve thumbnail" }, { status: 500 });
  }
}

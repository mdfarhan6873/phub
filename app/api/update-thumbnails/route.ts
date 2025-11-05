import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Video from "@/lib/modals/vedios";

const STREAMTAPE_LOGIN = process.env.STREAMTAPE_LOGIN;
const STREAMTAPE_KEY = process.env.STREAMTAPE_KEY;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    if (!STREAMTAPE_LOGIN || !STREAMTAPE_KEY) {
      return NextResponse.json({ error: "Streamtape credentials not configured" }, { status: 500 });
    }

    // Get all videos without thumbnails
    const videosWithoutThumbnails = await Video.find({ $or: [{ thumbnail: { $exists: false } }, { thumbnail: "" }] });

    console.log(`Found ${videosWithoutThumbnails.length} videos without thumbnails`);

    const updatedVideos = [];

    for (const video of videosWithoutThumbnails) {
      console.log(`Updating thumbnail for video: ${video.streamtapeId}`);

      // Try to get thumbnail with retry logic
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
        updatedVideos.push({ id: video._id, streamtapeId: video.streamtapeId, thumbnail: thumbnailUrl });
        console.log(`Updated thumbnail for video ${video.streamtapeId}: ${thumbnailUrl}`);
      } else {
        console.warn(`Could not get thumbnail for video ${video.streamtapeId}`);
      }
    }

    return NextResponse.json({
      message: `Updated ${updatedVideos.length} videos with thumbnails`,
      updatedVideos
    });

  } catch (error) {
    console.error("Error updating thumbnails:", error);
    return NextResponse.json({ error: "Failed to update thumbnails" }, { status: 500 });
  }
}

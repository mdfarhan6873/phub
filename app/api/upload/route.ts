import { NextRequest, NextResponse } from "next/server";

const STREAMTAPE_LOGIN = process.env.STREAMTAPE_LOGIN;
const STREAMTAPE_KEY = process.env.STREAMTAPE_KEY;

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!STREAMTAPE_LOGIN || !STREAMTAPE_KEY) {
      return NextResponse.json({ error: "Streamtape credentials not configured" }, { status: 500 });
    }

    // Get file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // First, get upload URL from Streamtape
    const uploadUrlResponse = await fetch(`https://api.streamtape.com/file/ul?login=${STREAMTAPE_LOGIN}&key=${STREAMTAPE_KEY}`);
    const uploadUrlData = await uploadUrlResponse.json();

    if (uploadUrlData.status !== 200) {
      return NextResponse.json({ error: uploadUrlData.msg || "Failed to get upload URL" }, { status: 500 });
    }

    const uploadUrl = uploadUrlData.result.url;

    // Upload video to the provided upload URL
    const formData = new FormData();
    formData.append("file", new Blob([buffer], { type: file.type }), file.name);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const responseText = await response.text();
    console.log("Streamtape response status:", response.status);
    console.log("Streamtape response text:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse Streamtape response:", responseText);
      return NextResponse.json({ error: "Invalid response from Streamtape", details: responseText }, { status: 500 });
    }

    if (result.status !== 200) {
      return NextResponse.json({ error: result.msg || "Upload failed" }, { status: 500 });
    }

    // Get thumbnail from Streamtape API with improved retry logic
    console.log("Getting thumbnail for file:", result.result.id);
    let thumbnailUrl = "";
    const maxRetries = 5;
    const retryDelay = 5000; // 5 seconds - increased delay for thumbnail generation

    // Wait initial 10 seconds before first attempt to allow thumbnail generation
    console.log("Waiting 10 seconds before attempting thumbnail retrieval...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`Thumbnail attempt ${attempt}/${maxRetries}`);
      try {
        const thumbnailResponse = await fetch(`https://api.streamtape.com/file/getsplash?login=${STREAMTAPE_LOGIN}&key=${STREAMTAPE_KEY}&file=${result.result.id}`);
        console.log("Thumbnail response status:", thumbnailResponse.status);
        const thumbnailData = await thumbnailResponse.json();
        console.log("Thumbnail data:", thumbnailData);

        if (thumbnailData.status === 200 && thumbnailData.result) {
          thumbnailUrl = thumbnailData.result;
          console.log("Thumbnail URL retrieved:", thumbnailUrl);
          break;
        } else {
          console.warn(`Failed to get thumbnail (attempt ${attempt}):`, thumbnailData.msg || thumbnailData);
          if (attempt < maxRetries) {
            console.log(`Waiting ${retryDelay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
          }
        }
      } catch (error) {
        console.error(`Error during thumbnail attempt ${attempt}:`, error);
        if (attempt < maxRetries) {
          console.log(`Waiting ${retryDelay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    if (!thumbnailUrl) {
      console.warn("Failed to get thumbnail after all retries - video uploaded successfully but thumbnail not available");
    }

    // Return Streamtape data and thumbnail URL
    return NextResponse.json({
      streamtapeId: result.result.id,
      link: result.result.url,
      thumbnail: thumbnailUrl
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
  }
}

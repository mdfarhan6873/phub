import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Video from "@/lib/modals/vedios";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const videos = await Video.find({})
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { title, category, streamtapeId, link, thumbnail } = await request.json();
    const video = new Video({ title, category, streamtapeId, link, thumbnail });
    await video.save();
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}

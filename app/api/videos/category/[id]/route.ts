import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Video from "@/lib/modals/vedios";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const videos = await Video.find({ category: id }).populate("category");
    return NextResponse.json(videos);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch videos for category" }, { status: 500 });
  }
}

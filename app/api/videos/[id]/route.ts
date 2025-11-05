import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Video from "@/lib/modals/vedios";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const video = await Video.findById(id).populate("category");
    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }
    return NextResponse.json(video);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const { action } = await request.json();

    if (action === "incrementViews") {
      const video = await Video.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      ).populate("category");
      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }
      return NextResponse.json(video);
    } else if (action === "incrementLike") {
      const video = await Video.findByIdAndUpdate(
        id,
        { $inc: { likes: 1 } },
        { new: true }
      ).populate("category");
      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }
      return NextResponse.json(video);
    } else if (action === "decrementLike") {
      const video = await Video.findByIdAndUpdate(
        id,
        { $inc: { likes: -1 } },
        { new: true }
      ).populate("category");
      if (!video) {
        return NextResponse.json({ error: "Video not found" }, { status: 404 });
      }
      return NextResponse.json(video);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update video" }, { status: 500 });
  }
}

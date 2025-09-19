import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Video from '@/lib/modals/videos';
import mongoose from 'mongoose';

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { message: 'Invalid page or limit parameters' },
        { status: 400 }
      );
    }

    const query: any = {};
    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return NextResponse.json(
          { message: 'Invalid category ID' },
          { status: 400 }
        );
      }
      query.category = category;
    }
    if (search) query.title = { $regex: search, $options: 'i' };

    const skip = (page - 1) * limit;
    const videos = await Video.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name');

    const total = await Video.countDocuments(query);

    return NextResponse.json({
      videos,
      total,
      hasMore: total > skip + limit
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const data = await request.json();

    // Validate required fields
    if (!data.title || !data.description || !data.videoId || !data.thumbnail || !data.duration) {
      return NextResponse.json(
        { message: 'Missing required fields: title, description, videoId, thumbnail, duration' },
        { status: 400 }
      );
    }

    // Convert category string to ObjectId if present
    if (data.category) {
      if (!mongoose.Types.ObjectId.isValid(data.category)) {
        return NextResponse.json(
          { message: 'Invalid category ID' },
          { status: 400 }
        );
      }
      data.category = new mongoose.Types.ObjectId(data.category);
    }

    const video = await Video.create(data);

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error creating video:', error);
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json(
        { message: 'Video with this videoId already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Video ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid video ID' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Convert category string to ObjectId if present
    if (data.category) {
      if (!mongoose.Types.ObjectId.isValid(data.category)) {
        return NextResponse.json(
          { message: 'Invalid category ID' },
          { status: 400 }
        );
      }
      data.category = new mongoose.Types.ObjectId(data.category);
    }

    const video = await Video.findByIdAndUpdate(id, data, { new: true }).populate('category', 'name');

    if (!video) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { message: 'Video ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid video ID' },
        { status: 400 }
      );
    }

    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return NextResponse.json(
        { message: 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Category from '@/lib/modals/categories';
import Video from '@/lib/modals/videos';
import { getVideoProvider } from '@/lib/services/media';

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ name: 1 });

    const transformed = categories.map((cat) => ({
      id: cat._id.toString(),
      name: cat.name,
      thumbnailUrl: cat.thumbnail,
    }));

    return NextResponse.json(transformed);
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}


export async function POST(request: Request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const thumbnail = formData.get('thumbnail') as File;

    if (!name || !thumbnail) {
      return NextResponse.json(
        { message: 'Name and thumbnail are required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Upload thumbnail using media service
    const provider = getVideoProvider();
    const uploadResult = await provider.uploadThumbnail(thumbnail);
    const thumbnailUrl = uploadResult.url;

    const category = await Category.create({
      name,
      slug,
      thumbnail: thumbnailUrl,
    });

    return NextResponse.json(category);
  } catch (error) {
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
        { message: 'Category ID is required' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const thumbnail = formData.get('thumbnail') as File;

    if (!name) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const updateData: any = { name, slug };

    // Upload new thumbnail if provided
    if (thumbnail) {
      const provider = getVideoProvider();
      const uploadResult = await provider.uploadThumbnail(thumbnail);
      updateData.thumbnail = uploadResult.url;
    }

    const category = await Category.findByIdAndUpdate(id, updateData, { new: true });

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
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
        { message: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category is being used by any videos
    const videoCount = await Video.countDocuments({ category: id });
    if (videoCount > 0) {
      return NextResponse.json(
        { message: 'Cannot delete category that has videos associated with it' },
        { status: 400 }
      );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { message: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}



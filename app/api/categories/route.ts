import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Category from "@/lib/modals/categories";

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({});
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name } = await request.json();
    const category = new Category({ name });
    await category.save();
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

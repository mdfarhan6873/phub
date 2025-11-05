import { NextRequest, NextResponse } from "next/server";

const STREAMTAPE_LOGIN = process.env.STREAMTAPE_LOGIN;
const STREAMTAPE_KEY = process.env.STREAMTAPE_KEY;

export async function POST(request: NextRequest) {
  try {
    const { action, file, folderId } = await request.json();

    if (!STREAMTAPE_LOGIN || !STREAMTAPE_KEY) {
      return NextResponse.json({ error: "Streamtape credentials not configured" }, { status: 500 });
    }

    let url = "";
    let formData = new FormData();

    switch (action) {
      case "upload":
        if (!file) {
          return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        url = "https://api.streamtape.com/file/upload";
        formData.append("login", STREAMTAPE_LOGIN);
        formData.append("key", STREAMTAPE_KEY);
        formData.append("file", file);
        if (folderId) formData.append("folder", folderId);
        break;

      case "list":
        url = `https://api.streamtape.com/file/list?login=${STREAMTAPE_LOGIN}&key=${STREAMTAPE_KEY}`;
        if (folderId) url += `&folder=${folderId}`;
        break;

      case "delete":
        if (!file) {
          return NextResponse.json({ error: "No file ID provided" }, { status: 400 });
        }
        url = `https://api.streamtape.com/file/delete?login=${STREAMTAPE_LOGIN}&key=${STREAMTAPE_KEY}&file=${file}`;
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const response = await fetch(url, {
      method: action === "upload" ? "POST" : "GET",
      body: action === "upload" ? formData : undefined,
    });

    const data = await response.json();

    if (data.status !== 200) {
      return NextResponse.json({ error: data.msg || "Streamtape API error" }, { status: 500 });
    }

    return NextResponse.json(data.result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to process Streamtape request" }, { status: 500 });
  }
}

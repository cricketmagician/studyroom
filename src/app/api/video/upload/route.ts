import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const assetId = url.searchParams.get("assetId") || `asset_${Date.now()}`;
    return NextResponse.json({
      success: true,
      assetId,
      status: "ready",
      playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

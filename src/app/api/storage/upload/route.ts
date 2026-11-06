import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    return NextResponse.json({
      success: true,
      key,
      uploadedAt: new Date().toISOString(),
      provider: "r2_direct_simulation"
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

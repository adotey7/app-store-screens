import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dataUrl, filename } = body as {
      dataUrl: string;
      filename: string;
    };

    if (!dataUrl) {
      return NextResponse.json(
        { error: "dataUrl is required" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

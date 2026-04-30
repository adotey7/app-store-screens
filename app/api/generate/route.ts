import { NextRequest, NextResponse } from "next/server";
import { generateLayout } from "@/lib/ai/generate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, previousMessages } = body as {
      prompt: string;
      previousMessages?: { role: "user" | "assistant"; content: string }[];
    };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const layout = await generateLayout({ prompt, previousMessages });

    return NextResponse.json(layout);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to generate layout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

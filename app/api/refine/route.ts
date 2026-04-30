import { NextRequest, NextResponse } from "next/server";
import { generateRefinement } from "@/lib/ai/generate";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, currentLayout } = body as {
      prompt: string;
      currentLayout: import("@/types").ScreenLayout;
    };

    if (!prompt || !currentLayout) {
      return NextResponse.json(
        { error: "Prompt and currentLayout are required" },
        { status: 400 }
      );
    }

    const layout = await generateRefinement(prompt, currentLayout);

    return NextResponse.json(layout);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to refine layout";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

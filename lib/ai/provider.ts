import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

export type AIProvider = "google" | "openai";

function getProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "google";
  if (provider !== "google" && provider !== "openai") {
    throw new Error(`Unknown AI_PROVIDER: ${provider}. Must be "google" or "openai".`);
  }
  return provider;
}

function getGoogleModel(): LanguageModel {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY is required when AI_PROVIDER=google. Set it in .env.local"
    );
  }
  const modelId = process.env.GOOGLE_MODEL || "gemini-2.0-flash-001";
  return google(modelId);
}

function getOpenAIModel(): LanguageModel {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is required when AI_PROVIDER=openai. Set it in .env.local"
    );
  }
  const modelId = process.env.OPENAI_MODEL || "gpt-4o";
  return openai(modelId);
}

export function getModel(): LanguageModel {
  const provider = getProvider();

  switch (provider) {
    case "google":
      return getGoogleModel();
    case "openai":
      return getOpenAIModel();
  }
}

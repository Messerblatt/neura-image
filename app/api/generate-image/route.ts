import { GoogleGenAI } from "@google/genai";
import { put } from "@vercel/blob";

export const runtime = "nodejs";
export const maxDuration = 60;

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY");
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  throw new Error("Missing BLOB_READ_WRITE_TOKEN");
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9äöüß]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json(
        { error: "Prompt fehlt oder ist ungültig." },
        { status: 400 }
      );
    }

    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1,
      },
    });

    const image = response.generatedImages?.[0]?.image;

    if (!image?.imageBytes) {
      return Response.json(
        { error: "Es wurde kein Bild erzeugt." },
        { status: 500 }
      );
    }

    const imageBuffer = Buffer.from(image.imageBytes, "base64");

    const now = new Date();
    const dateFolder = now.toISOString().slice(0, 10);
    const filename = `${Date.now()}-${slugify(prompt) || "image"}.png`;

    const pathname = `generated-images/${dateFolder}/${filename}`;

    const blob = await put(pathname, imageBuffer, {
      access: "public",
      contentType: "image/png",
    });

    return Response.json({
      prompt,
      imageUrl: blob.url,
      pathname: blob.pathname,
    });
  } catch (error) {
    console.error("Image generation error:", error);

    return Response.json(
      { error: "Bildgenerierung fehlgeschlagen." },
      { status: 500 }
    );
  }
}
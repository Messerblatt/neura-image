import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const maxDuration = 60;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

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

    return Response.json({
      imageBase64: image.imageBytes,
      mimeType: "image/png",
      prompt,
    });
  } catch (error) {
    console.error("Image generation error:", error);

    return Response.json(
      { error: "Bildgenerierung fehlgeschlagen." },
      { status: 500 }
    );
  }
}
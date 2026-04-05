import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient } from "@/lib/gemini";
import { extractTextFromFile } from "@/lib/file-extractors";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

const ANALYSIS_PROMPT = `You are analyzing a document related to international trade and customs.
Extract the product names, descriptions, and any HS/tariff codes mentioned.

Return ONLY a valid JSON object with this exact structure:
{
  "keywords": ["keyword1", "keyword2"],
  "description": "Brief product description in the document's language",
  "detectedCodes": ["8471.30"]
}

Rules:
- "keywords" should contain 3-8 product keywords suitable for customs tariff code search. Keywords MUST be in French (the Algerian customs database is in French).
- "description" is a 1-2 sentence summary of the products found.
- "detectedCodes" lists any HS/tariff codes explicitly found in the document (empty array if none).
- Return ONLY the JSON, no markdown fences, no other text.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const lang = (formData.get("lang") as string) || "fr";

    if (!file) {
      return NextResponse.json({ error: "NO_FILE" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "INVALID_FILE_TYPE" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "FILE_TOO_LARGE" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Build content parts for Gemini
    const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

    if (IMAGE_TYPES.has(file.type) || file.type === "application/pdf") {
      // Gemini supports images and PDFs as inline data
      parts.push({
        inlineData: {
          mimeType: file.type,
          data: buffer.toString("base64"),
        },
      });
    } else {
      // DOCX or XLSX — extract text first
      const extractedText = await extractTextFromFile(buffer, file.type);
      if (!extractedText || extractedText.trim().length === 0) {
        return NextResponse.json(
          { error: "EMPTY_DOCUMENT" },
          { status: 400 }
        );
      }
      parts.push({
        text: `Document content (${file.name}):\n\n${extractedText}`,
      });
    }

    parts.push({ text: ANALYSIS_PROMPT });

    const result = await model.generateContent(parts);
    const response = result.response;

    // Check for safety filter blocks
    if (response.candidates && response.candidates[0]?.finishReason === "SAFETY") {
      console.error("Gemini blocked by safety filter:", response.candidates[0].safetyRatings);
      return NextResponse.json(
        { error: "ANALYSIS_FAILED" },
        { status: 500 }
      );
    }

    const text = response.text();

    if (!text || text.trim().length === 0) {
      console.error("Gemini returned empty response. Candidates:", JSON.stringify(response.candidates));
      return NextResponse.json(
        { error: "ANALYSIS_FAILED" },
        { status: 500 }
      );
    }

    // Parse JSON from Gemini's response
    let parsed: {
      keywords: string[];
      description: string;
      detectedCodes: string[];
    };

    try {
      // Strip markdown fences if present
      let jsonText = text.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      }
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON. Raw text:", text);
      return NextResponse.json(
        { error: "ANALYSIS_FAILED" },
        { status: 500 }
      );
    }

    // Build suggested query from top keywords
    const suggestedQuery = parsed.keywords.slice(0, 3).join(" ");

    return NextResponse.json({
      keywords: parsed.keywords,
      description: parsed.description,
      detectedCodes: parsed.detectedCodes || [],
      suggestedQuery,
    });
  } catch (error) {
    console.error("Tariff analyze error:", error);
    return NextResponse.json(
      { error: "ANALYSIS_FAILED" },
      { status: 500 }
    );
  }
}

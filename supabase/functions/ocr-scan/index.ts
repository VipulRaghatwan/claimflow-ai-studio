import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("No file provided");

    // Validate file
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) throw new Error("File too large. Maximum 20MB.");

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      throw new Error("Invalid file type. Supported: JPG, PNG, WebP, GIF, PDF");
    }

    // Convert file to base64
    const arrayBuf = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    // Build multimodal message
    const contentParts: any[] = [
      {
        type: "text",
        text: `You are an AI insurance claim assistant. Analyze this uploaded document/image thoroughly.

Extract ALL text visible in the document using OCR. Then parse the extracted text and return structured data.

Use the provided tool to return the results.`,
      },
    ];

    if (file.type.startsWith("image/")) {
      contentParts.push({
        type: "image_url",
        image_url: {
          url: `data:${file.type};base64,${base64}`,
        },
      });
    } else if (file.type === "application/pdf") {
      // For PDF, we send as inline data
      contentParts.push({
        type: "text",
        text: `[This is a PDF document named "${file.name}". Please analyze any text content you can identify.]`,
      });
      // Gemini supports inline PDF via file_data-like approach, but through the gateway
      // we use image_url with the data URI
      contentParts.push({
        type: "image_url",
        image_url: {
          url: `data:application/pdf;base64,${base64}`,
        },
      });
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an AI insurance claim assistant. Extract all text from the document and return structured JSON with fields: name, date, amount, policy_number, damage_type. If any field is missing, return null.",
          },
          { role: "user", content: contentParts },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_ocr_results",
              description: "Submit the OCR extraction results",
              parameters: {
                type: "object",
                properties: {
                  name: { type: "string", description: "Name of the claimant or insured party" },
                  date: { type: "string", description: "Date of incident or document date" },
                  amount: { type: "string", description: "Claim amount or total amount mentioned" },
                  policy_number: { type: "string", description: "Insurance policy number" },
                  damage_type: { type: "string", description: "Type of damage described" },
                  raw_text: { type: "string", description: "All raw text extracted from the document via OCR" },
                },
                required: ["raw_text"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_ocr_results" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No OCR results returned from AI");

    const ocrData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ success: true, data: ocrData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ocr-scan error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

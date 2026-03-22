import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const { claimId } = await req.json();
    if (!claimId) throw new Error("claimId is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get claim files
    const { data: files, error: filesError } = await supabase
      .from("claim_files")
      .select("*")
      .eq("claim_id", claimId);

    if (filesError) throw new Error(`Failed to fetch files: ${filesError.message}`);
    if (!files || files.length === 0) throw new Error("No files found for this claim");

    // Get signed URLs for files
    const fileDetails = [];
    for (const file of files) {
      const { data: signedUrl } = await supabase.storage
        .from("claim-files")
        .createSignedUrl(file.file_path, 3600);

      if (signedUrl) {
        fileDetails.push({
          name: file.file_name,
          type: file.file_type,
          url: signedUrl.signedUrl,
          size: file.file_size,
        });
      }
    }

    const imageFiles = fileDetails.filter((f) => f.type.startsWith("image"));
    const docFiles = fileDetails.filter((f) => !f.type.startsWith("image"));

    // Build the analysis prompt
    const prompt = `You are an expert insurance claims analyst AI. Analyze the following claim submission and provide a comprehensive assessment.

The claim has ${files.length} file(s) uploaded:
- ${imageFiles.length} image(s): ${imageFiles.map((f) => f.name).join(", ") || "none"}
- ${docFiles.length} document(s): ${docFiles.map((f) => f.name).join(", ") || "none"}

Based on these files, provide a detailed analysis using the tool provided. Consider:
1. Damage severity assessment (minor/moderate/severe/total-loss)
2. Detailed damage description
3. Estimated repair cost with breakdown
4. Fraud risk assessment (low/medium/high)
5. Any OCR data you can extract from document names and types
6. A professional recommendation

For the cost breakdown, provide realistic estimates for an insurance claim. Consider typical repair costs for the type of damage described by the file names.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "You are an expert insurance claims analyst. Provide thorough, professional analysis.",
          },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_claim_analysis",
              description: "Submit the complete claim analysis results",
              parameters: {
                type: "object",
                properties: {
                  damage_severity: {
                    type: "string",
                    enum: ["Minor", "Moderate", "Severe", "Total Loss"],
                  },
                  damage_description: {
                    type: "string",
                    description: "Detailed description of the damage detected",
                  },
                  estimated_cost: {
                    type: "number",
                    description: "Total estimated repair/replacement cost in USD",
                  },
                  cost_breakdown: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        item: { type: "string" },
                        cost: { type: "number" },
                      },
                      required: ["item", "cost"],
                    },
                  },
                  fraud_risk: {
                    type: "string",
                    enum: ["Low", "Medium", "High"],
                  },
                  fraud_details: {
                    type: "string",
                    description: "Details about fraud analysis including image vs text consistency",
                  },
                  confidence_score: {
                    type: "number",
                    description: "Confidence score 0-100",
                  },
                  ocr_extracted_data: {
                    type: "object",
                    properties: {
                      vehicle_info: { type: "string" },
                      date_of_incident: { type: "string" },
                      policy_number: { type: "string" },
                      additional_notes: { type: "string" },
                    },
                  },
                  report: {
                    type: "string",
                    description: "Full AI-generated professional report with sections for Damage Assessment, Cost Breakdown, Fraud Analysis, and Recommendation",
                  },
                  recommendation: {
                    type: "string",
                    description: "Final recommendation for the claim",
                  },
                },
                required: [
                  "damage_severity",
                  "damage_description",
                  "estimated_cost",
                  "cost_breakdown",
                  "fraud_risk",
                  "fraud_details",
                  "confidence_score",
                  "report",
                  "recommendation",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_claim_analysis" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No analysis returned from AI");

    const analysis = JSON.parse(toolCall.function.arguments);
    const processingTime = Date.now() - startTime;

    // Update claim with analysis results
    const { error: updateError } = await supabase
      .from("claims")
      .update({
        status: "analyzed",
        damage_severity: analysis.damage_severity,
        damage_description: analysis.damage_description,
        estimated_cost: analysis.estimated_cost,
        cost_breakdown: analysis.cost_breakdown,
        fraud_risk: analysis.fraud_risk,
        fraud_details: analysis.fraud_details,
        confidence_score: analysis.confidence_score,
        ocr_extracted_data: analysis.ocr_extracted_data || {},
        ai_report: analysis.report,
        ai_recommendation: analysis.recommendation,
        processing_time_ms: processingTime,
        updated_at: new Date().toISOString(),
      })
      .eq("id", claimId);

    if (updateError) throw new Error(`Failed to update claim: ${updateError.message}`);

    return new Response(
      JSON.stringify({ success: true, claimId, processingTime }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("analyze-claim error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

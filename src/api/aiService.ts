import { API_URL } from "./postgres/client";

export async function askGroq(prompt: string) {
  try {
    const res = await fetch(`${API_URL}/api/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      console.error("AI service error:", res.status);
      return "⚠️ AI Error: Backend service unavailable";
    }

    const data = await res.json();
    return data.result || "";
  } catch (err) {
    console.error("AI Service Error:", err);
    return "⚠️ AI Error: Network request failed";
  }
}

/**
 * analyzeClusterWithGroq
 * - Accepts an array of recent symptom reports (plain JS objects)
 * - Builds a compact prompt and asks Groq whether these reports indicate an outbreak
 * - Returns parsed object { outbreak: boolean, risk: "Low"|"Medium"|"High", reason: string }
 */
export async function analyzeClusterWithGroq(recentReports = []) {
  // build compact summary of the recent reports
  const sampleText = recentReports
    .slice(0, 20)
    .map((r, idx) => {
      const s = (r.symptoms || []).join(",");
      const v = r.village || r.location?.village || "unknown";
      return `${idx + 1}. ${r.name || "Anon"} | village:${v} | symptoms:[${s}] | ts:${r.timestamp || r.createdAt || "n/a"}`;
    })
    .join("\n");

  const prompt = `
You are a public health early-warning assistant.

Given the following recent symptom reports (one per line):
${sampleText}

Questions:
1) Based on patterns & similar symptom codes, is there evidence that these reports could represent an outbreak in the same village/area? Answer briefly with "Yes" or "No".
2) If Yes, give a risk level: High / Medium / Low and one short reason (1 sentence).
3) If No, give a short reason.

Return the response in JSON only, with fields:
{ "outbreak": true|false, "risk": "High"|"Medium"|"Low"|"None", "reason": "..." }
Do NOT include extra commentary.
`;

  try {
    const raw = await askGroq(prompt);
    // try parse JSON from raw response (some responses may include text around JSON — attempt to extract)
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd >= 0) {
      const jsonText = raw.slice(jsonStart, jsonEnd + 1);
      try {
        const parsed = JSON.parse(jsonText);
        // normalize
        return {
          outbreak: Boolean(parsed.outbreak),
          risk: parsed.risk || (parsed.outbreak ? "Medium" : "None"),
          reason: parsed.reason || "",
          raw,
        };
      } catch (e) {
        console.warn("Groq returned non-JSON; fallback parsing. Raw:", raw);
      }
    }

    // Fallback — simple heuristics from text
    const lowRaw = raw.toLowerCase();
    const outbreak = /yes|outbreak|probable|likely/.test(lowRaw);
    let risk: "High" | "Medium" | "Low" | "None" = "None";
    if (outbreak) {
      if (/high|severe|urgent/.test(lowRaw)) risk = "High";
      else if (/medium|moderate/.test(lowRaw)) risk = "Medium";
      else risk = "Low";
    }

    return {
      outbreak,
      risk,
      reason: raw.replace(/\n+/g, " ").slice(0, 400),
      raw,
    };
  } catch (err) {
    console.error("analyzeClusterWithGroq error:", err);
    return { outbreak: false, risk: "None", reason: "AI error", raw: "" };
  }
}

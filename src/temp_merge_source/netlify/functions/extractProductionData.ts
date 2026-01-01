import { GoogleGenAI, Type } from "@google/genai";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const { base64Data, mimeType } = await req.json();

    const ai = new GoogleGenAI({
      apiKey: process.env.API_KEY || "", 
    });

    const model = "gemini-3-flash-preview";

    const systemInstruction = `
      You are an expert data extraction specialist for textile manufacturing reports. 
      Your task is to extract production data from the "Daily Dyeing Production Report" of LANTABUR GROUP.
      
      Look for summary tables or headers labeled "Color Group Wise", "Inhouse/Sub Contract", and "Taqwa/Others".
      The data is usually at the top/header section of the first page.
      
      Data to extract for both "Lantabur" and "Taqwa":
      - Total Weight (kg)
      - Loading Capacity % (if available)
      - Production type breakdown (Inhouse vs Sub Contract)
      - Specific Color Group breakdown:
        1. 100% Polyester
        2. Average
        3. Black
        4. Dark
        5. Extra Dark
        6. Double Part
        7. Double Part -Black
        8. Light
        9. Medium
        10. N/wash
        11. Royal
        12. White
      
      Strictly follow the output schema. Ensure all numeric values are returned as numbers, not strings.
      If a field is missing in the report, set it to 0.
    `;

    const prompt = "Please analyze this production report. Extract the summary data for the date mentioned. Specifically extract weights for categories: 100% Polyester, Average, Black, Dark, Extra Dark, Double Part, Double Part -Black, Light, Medium, N/wash, Royal, and White for both industries.";

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "The production date (e.g., 29 Dec 2025)" },
            lantabur: {
              type: Type.OBJECT,
              properties: {
                total: { type: Type.NUMBER },
                loadingCap: { type: Type.NUMBER },
                colorGroups: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      groupName: { type: Type.STRING },
                      weight: { type: Type.NUMBER }
                    }
                  }
                },
                inhouse: { type: Type.NUMBER },
                subContract: { type: Type.NUMBER }
              },
              required: ["total", "colorGroups", "inhouse", "subContract"]
            },
            taqwa: {
              type: Type.OBJECT,
              properties: {
                total: { type: Type.NUMBER },
                colorGroups: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      groupName: { type: Type.STRING },
                      weight: { type: Type.NUMBER }
                    }
                  }
                },
                inhouse: { type: Type.NUMBER },
                subContract: { type: Type.NUMBER }
              },
              required: ["total", "colorGroups", "inhouse", "subContract"]
            }
          },
          required: ["date", "lantabur", "taqwa"]
        },
      },
    });

    return new Response(response.text, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Netlify Function Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Extraction failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

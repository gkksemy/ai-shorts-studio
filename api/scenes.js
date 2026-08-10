export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { idea, style } = req.body;

    if (!idea || !idea.trim()) {
      return res.status(400).json({
        error: "Please provide a video idea."
      });
    }

    const visualStyle =
      style === "realistic"
        ? "realistic cinematic live-action"
        : "colorful cartoon animation";

    const prompt = `
Create a 30-second short video based on this idea:

${idea}

Visual style:
${visualStyle}

Break the story into EXACTLY 6 scenes.
Each scene represents approximately 5 seconds.

Return ONLY valid JSON in this exact structure:

{
  "scenes": [
    {
      "scene": 1,
      "duration": 5,
      "visual": "what appears on screen",
      "action": "what happens"
    },
    {
      "scene": 2,
      "duration": 5,
      "visual": "what appears on screen",
      "action": "what happens"
    },
    {
      "scene": 3,
      "duration": 5,
      "visual": "what appears on screen",
      "action": "what happens"
    },
    {
      "scene": 4,
      "duration": 5,
      "visual": "what appears on screen",
      "action": "what happens"
    },
    {
      "scene": 5,
      "duration": 5,
      "visual": "what appears on screen",
      "action": "what happens"
    },
    {
      "scene": 6,
      "duration": 5,
      "visual": "what appears on screen",
      "action": "what happens"
    }
  ]
}

Keep the characters, appearance, clothing, environment, and visual style consistent throughout all six scenes.
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5",
          input: prompt,
          text: {
            format: {
              type: "json_object"
            }
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI API error"
      });
    }

    let text = "";

    if (data.output_text) {
      text = data.output_text;
    } else if (data.output) {
      for (const item of data.output) {
        if (item.type === "message" && item.content) {
          for (const content of item.content) {
            if (content.type === "output_text") {
              text += content.text;
            }
          }
        }
      }
    }

    if (!text) {
      return res.status(500).json({
        error: "OpenAI returned no scene data."
      });
    }

    let scenes;

    try {
      scenes = JSON.parse(text);
    } catch (parseError) {
      return res.status(500).json({
        error: "OpenAI returned invalid JSON.",
        raw: text
      });
    }

    if (
      !scenes.scenes ||
      !Array.isArray(scenes.scenes) ||
      scenes.scenes.length !== 6
    ) {
      return res.status(500).json({
        error: "OpenAI did not return exactly 6 scenes."
      });
    }

    return res.status(200).json(scenes);

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

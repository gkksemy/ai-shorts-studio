export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { idea, style } = req.body;

    if (!idea || !idea.trim()) {
      return res.status(400).json({
        error: "Please enter a video idea."
      });
    }

    const selectedStyle =
      style === "realistic" ? "realistic live-action" : "cartoon animated";

    const prompt = `
Create a short-form YouTube Shorts video script.

Video idea:
${idea}

Visual style:
${selectedStyle}

Requirements:
- Make it engaging from the first few seconds.
- Create 5 short scenes.
- Include narration for each scene.
- Include a visual description for each scene.
- Keep the story easy to understand.
- Make it suitable for a general audience.
- End with a memorable moment.

Format:

TITLE:

SCENE 1:
Visual:
Narration:

SCENE 2:
Visual:
Narration:

SCENE 3:
Visual:
Narration:

SCENE 4:
Visual:
Narration:

SCENE 5:
Visual:
Narration:
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
          input: prompt
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI API error"
      });
    }

    return res.status(200).json({
      script: data.output_text
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

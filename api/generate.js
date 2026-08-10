export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { idea, style, duration } = req.body;

    if (!idea || !idea.trim()) {
      return res.status(400).json({
        error: "Please enter a video idea."
      });
    }

    const selectedStyle =
      style === "realistic"
        ? "realistic live-action"
        : "cartoon animated";

    const videoDuration = Number(duration) || 30;

    const prompt = `
Create a complete YouTube Shorts script.

VIDEO IDEA:
${idea}

VISUAL STYLE:
${selectedStyle}

VIDEO LENGTH:
${videoDuration} seconds

IMPORTANT:
- Make the script appropriate for the selected video length.
- Keep the pacing engaging.
- Break the story into scenes.
- Include a visual description for every scene.
- Include narration/dialogue for every scene.
- Make the scenes flow naturally from beginning to end.
- Create enough scenes to fill approximately ${videoDuration} seconds.
- Make the ending memorable.

FORMAT:

TITLE:

TOTAL LENGTH:
${videoDuration} seconds

SCENE 1:
Time:
Visual:
Narration/Dialog:

SCENE 2:
Time:
Visual:
Narration/Dialog:

SCENE 3:
Time:
Visual:
Narration/Dialog:

Continue adding scenes until the full video length is covered.

ENDING:
Visual:
Narration/Dialog:
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

    const script =
      data.output_text ||
      data.output
        ?.map(item =>
          item.content
            ?.map(content => content.text || "")
            .join("")
        )
        .join("\n") ||
      "No script was generated.";

    return res.status(200).json({
      script: script
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { scenes } = req.body;

    if (!Array.isArray(scenes) || scenes.length !== 6) {
      return res.status(400).json({
        error: "Exactly 6 scenes are required."
      });
    }

    const results = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];

      const prompt =
        `${scene.visual}. ${scene.action}. ` +
        `Maintain consistent characters, environment, clothing, ` +
        `appearance and visual style. ` +
        `Vertical 9:16 short-form video, cinematic camera movement.`;

      const response = await fetch(
        "https://api.dev.runwayml.com/v1/text_to_video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization":
              `Bearer ${process.env.RUNWAY_API_KEY}`,
            "X-Runway-Version": "2024-11-06"
          },
          body: JSON.stringify({
            model: "gen4.5",
            promptText: prompt,
            ratio: "720:1280",
            duration: 5
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          error:
            data.error ||
            data.message ||
            "Runway API error",
          scene: i + 1
        });
      }

      results.push({
        scene: i + 1,
        taskId: data.id
      });
    }

    return res.status(200).json({
      success: true,
      tasks: results
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

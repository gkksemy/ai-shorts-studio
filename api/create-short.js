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

    const taskIds = [];

    for (const scene of scenes) {

      const prompt =
        `${scene.visual}. ${scene.action}. ` +
        `Maintain consistent characters, environment and visual style. ` +
        `Vertical short-form video, cinematic camera movement.`;

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
            "Runway API error"
        });
      }

      taskIds.push(data.id);
    }

    return res.status(200).json({
      taskIds: taskIds
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { prompt, duration } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({
        error: "Please provide a video prompt."
      });
    }

    const seconds = Math.min(
      Math.max(Number(duration) || 5, 2),
      10
    );

    const response = await fetch(
      "https://api.dev.runwayml.com/v1/image_to_video",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
          "X-Runway-Version": "2024-11-06"
        },
        body: JSON.stringify({
          model: "gen4_turbo",
          promptImage: prompt,
          promptText: prompt,
          ratio: "720:1280",
          duration: seconds
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || data.message || "Runway API error"
      });
    }

    return res.status(200).json({
      taskId: data.id
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

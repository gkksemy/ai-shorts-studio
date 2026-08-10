export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const taskId = req.query.taskId;

    if (!taskId) {
      return res.status(400).json({
        error: "Missing taskId"
      });
    }

    const response = await fetch(
      `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${process.env.RUNWAY_API_KEY}`,
          "X-Runway-Version": "2024-11-06"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error || data.message || "Runway API error"
      });
    }

    return res.status(200).json({
      status: data.status,
      output: data.output || null
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

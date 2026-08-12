export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { taskIds } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length !== 6) {
      return res.status(400).json({
        error: "Exactly 6 task IDs are required."
      });
    }

    const results = await Promise.all(
      taskIds.map(async (taskId) => {

        const response = await fetch(
          `https://api.dev.runwayml.com/v1/tasks/${taskId}`,
          {
            method: "GET",
            headers: {
              "Authorization":
                `Bearer ${process.env.RUNWAY_API_KEY}`,
              "X-Runway-Version": "2024-11-06"
            }
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return {
            taskId,
            status: "ERROR",
            output: null,
            error:
              data.error ||
              data.message ||
              "Runway API error"
          };
        }

        return {
          taskId,
          status: data.status,
          output: data.output || null
        };
      })
    );

    const hasFailed = results.some(
      item =>
        item.status === "FAILED" ||
        item.status === "CANCELED" ||
        item.status === "ERROR"
    );

    if (hasFailed) {
      return res.status(200).json({
        status: "FAILED",
        results
      });
    }

    const allSucceeded = results.every(
      item => item.status === "SUCCEEDED"
    );

    if (!allSucceeded) {
      return res.status(200).json({
        status: "PROCESSING",
        results
      });
    }

    const videos = results.map(
      item => item.output?.[0] || null
    );

    return res.status(200).json({
      status: "SUCCEEDED",
      videos
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

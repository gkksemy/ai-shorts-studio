export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { renderId } = req.query;

    if (!renderId) {
      return res.status(400).json({
        error: "Missing renderId"
      });
    }

    const response = await fetch(
      `https://api.shotstack.io/edit/v1/render/${renderId}`,
      {
        method: "GET",
        headers: {
          "x-api-key": process.env.SHOTSTACK_API_KEY
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data.message ||
          data.error ||
          "Shotstack API error"
      });
    }

    return res.status(200).json({
      status: data.response?.status || data.status,
      url: data.response?.url || null
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

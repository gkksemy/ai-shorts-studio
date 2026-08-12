export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { videos } = req.body;

    if (!Array.isArray(videos) || videos.length !== 6) {
      return res.status(400).json({
        error: "Exactly 6 video URLs are required."
      });
    }

    const clips = videos.map((videoUrl) => ({
      asset: {
        type: "video",
        src: videoUrl
      },
      start: 0,
      length: 5
    }));

    const edit = {
      timeline: {
        background: "#000000",
        tracks: [
          {
            clips: clips
          }
        ]
      },
      output: {
        format: "mp4",
        resolution: "hd",
        aspectRatio: "9:16"
      }
    };

    const response = await fetch(
      "https://api.shotstack.io/edit/v1/render",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.SHOTSTACK_API_KEY
        },
        body: JSON.stringify(edit)
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
      success: true,
      renderId: data.response?.id || data.id
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message
    });
  }
}

const formidable = require("formidable");
import fs from "fs";
import fetch from "node-fetch";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

 const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parsing failed" });

    const file = files.image;
    if (!file || !file.filepath) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    try {
      const imageBuffer = fs.readFileSync(file.filepath);

      const response = await fetch(
        "https://api-inference.huggingface.co/models/akhaliq/Emotion-detection",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_API_KEY}`,
            "Content-Type": "application/octet-stream",
          },
          body: imageBuffer,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return res
          .status(response.status)
          .json({ error: error.error || "Hugging Face API error" });
      }

      const result = await response.json();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
  });
}

import { Request, Response } from "express";
export const uploadImage = async (req: Request, res: Response) => {
  try {
    const { image } = req.body;
    if (!image) {
      res.status(400).json({
        success: false,
        message: "Please provide an image.",
      });
      return;
    }
    const apiKey = process.env.IMGBB_API_KEY;
    const apiUrl = process.env.IMGBB_API_URL;
    if (!apiKey || !apiUrl) {
      res.status(500).json({
        success: false,
        message: "Image upload configuration is missing.",
      });
      return;
    }
    const formData = new FormData();
    formData.append(
      "image",
      image.replace(/^data:image\/\w+;base64,/, "")
    );
    const uploadUrl = new URL(apiUrl);
    uploadUrl.searchParams.set("key", apiKey);
    const response = await fetch(uploadUrl.toString(), {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      res.status(400).json({
        success: false,
        message: "Image upload failed.",
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      imageUrl: result.data.url,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong while uploading the image.",
    });
  }
};
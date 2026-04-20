import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = process.env.GHL_PRIVATE_TOKEN;
    const locationId = process.env.GHL_LOCATION_ID;

    if (!token) {
      return res.status(500).json({ success: false, message: "Missing GHL_PRIVATE_TOKEN" });
    }

    if (!locationId) {
      return res.status(500).json({ success: false, message: "Missing GHL_LOCATION_ID" });
    }

    const response = await fetch(
      `https://services.leadconnectorhq.com/locations/${locationId}/customFields`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          Version: "2021-07-28",
          "Content-Type": "application/json",
        },
      }
    );

    const rawText = await response.text();
    let data: any = null;

    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = { rawText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: data?.message || data?.error || "Failed to fetch custom fields",
        data,
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
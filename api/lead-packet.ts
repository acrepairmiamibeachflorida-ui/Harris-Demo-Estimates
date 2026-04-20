import type { VercelRequest, VercelResponse } from "@vercel/node";

type LeadPacket = {
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  estimate: {
    project: string | null;
    size: string | null;
    finish: string | null;
    min: number;
    max: number;
    displayRange: string;
  };
  meta: {
    createdAt: string;
    leadSource: string;
    status: string;
  };
};

function isValidLeadPacket(data: unknown): data is LeadPacket {
  if (!data || typeof data !== "object") return false;

  const packet = data as LeadPacket;

  return !!(
    packet.contact &&
    typeof packet.contact.name === "string" &&
    typeof packet.contact.email === "string" &&
    typeof packet.contact.phone === "string" &&
    packet.estimate &&
    typeof packet.estimate.min === "number" &&
    typeof packet.estimate.max === "number" &&
    typeof packet.estimate.displayRange === "string" &&
    packet.meta &&
    typeof packet.meta.createdAt === "string" &&
    typeof packet.meta.leadSource === "string" &&
    typeof packet.meta.status === "string"
  );
}

function buildEstimateTags(packet: LeadPacket) {
  const tags = ["Estimator Funnel Lead"];

  if (packet.estimate.project) tags.push(`Project - ${packet.estimate.project}`);
  if (packet.estimate.size) tags.push(`Size - ${packet.estimate.size}`);
  if (packet.estimate.finish) tags.push(`Finish - ${packet.estimate.finish}`);

  if (packet.estimate.max >= 250000) {
    tags.push("Estimate Tier - 250K+");
  } else if (packet.estimate.max >= 100000) {
    tags.push("Estimate Tier - 100K-250K");
  } else {
    tags.push("Estimate Tier - Under 100K");
  }

  return tags;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    const body = req.body;

    if (!isValidLeadPacket(body)) {
      return res.status(400).json({
        success: false,
        message: "Invalid lead packet",
      });
    }

    const packet = body;
    const webhookUrl =
      "https://services.leadconnectorhq.com/hooks/VakbeyekaByOi7IxKWOi/webhook-trigger/a104e283-f199-4f7c-b420-fa11f1672978";

    const payload = {
      name: packet.contact.name,
      email: packet.contact.email,
      phone: packet.contact.phone,
      project: packet.estimate.project,
      size: packet.estimate.size,
      finish: packet.estimate.finish,
      estimateMin: packet.estimate.min,
      estimateMax: packet.estimate.max,
      estimateDisplayRange: packet.estimate.displayRange,
      leadSource: packet.meta.leadSource,
      estimateStatus: packet.meta.status,
      createdAt: packet.meta.createdAt,
      tags: buildEstimateTags(packet),
      leadPacket: packet,
    };

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let result: any = null;

    try {
      result = rawText ? JSON.parse(rawText) : null;
    } catch {
      result = { rawText };
    }

    if (!response.ok) {
      throw new Error(
        result?.message || result?.error || "Failed to send lead to GHL webhook"
      );
    }

    return res.status(200).json({
      success: true,
      message: "Lead sent to GHL webhook successfully.",
      webhookResponse: result,
    });
  } catch (error) {
    console.error("WEBHOOK SUBMIT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Unknown server error",
    });
  }
}
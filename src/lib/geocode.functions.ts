import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_maps";

async function callGateway(path: string) {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!GOOGLE_MAPS_API_KEY) throw new Error("GOOGLE_MAPS_API_KEY is not configured");

  const res = await fetch(`${GATEWAY_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_MAPS_API_KEY,
    },
  });
  const data = (await res.json()) as {
    status?: string;
    results?: Array<{ formatted_address?: string }>;
    error_message?: string;
  };
  if (!res.ok || (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS")) {
    throw new Error(
      `Google Maps geocode failed [${res.status}] ${data.status ?? ""}: ${data.error_message ?? ""}`,
    );
  }
  return data;
}

export const reverseGeocode = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const data_ = await callGateway(
      `/maps/api/geocode/json?latlng=${data.lat},${data.lng}`,
    );
    const address = data_.results?.[0]?.formatted_address ?? "";
    return { address };
  });

import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

type HistoryEntry = {
  timestamp: string;
  image: string;
  nodeId: string;
  h: number;
  d: number;
  diff: number;
};

function readStringField(formData: FormData, keys: string[], fallback: string) {
  for (const key of keys) {
    const rawValue = formData.get(key);

    if (typeof rawValue === "string" && rawValue.trim().length > 0) {
      return rawValue.trim();
    }
  }

  return fallback;
}

function readNumericField(
  formData: FormData,
  keys: string[],
  fallback: number,
) {
  for (const key of keys) {
    const rawValue = formData.get(key);

    if (typeof rawValue === "string") {
      const parsedValue = Number(rawValue);

      if (!Number.isNaN(parsedValue)) {
        return parsedValue;
      }
    }
  }

  return fallback;
}

function formatFileTimestamp(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const h = readNumericField(formData, ["h", "height", "waterLevel"], 10.7);
    const d = readNumericField(
      formData,
      ["d", "diameter", "containerDiameter"],
      10.4,
    );
    const nodeId = readStringField(
      formData,
      ["nodeId", "node", "id"],
      "node_1",
    );
    const diff = readNumericField(
      formData,
      ["diff", "difference"],
      Math.abs(h - d),
    );

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const captureDate = new Date();
    const filename = `capture_${formatFileTimestamp(captureDate)}.jpg`;

    const publicDir = join(process.cwd(), "public");
    const capturesDir = join(publicDir, "captures");
    const dataPath = join(publicDir, "data.json");

    await mkdir(capturesDir, { recursive: true });
    await writeFile(join(capturesDir, filename), buffer);

    let data: { diameter: number; history: HistoryEntry[] } = {
      diameter: d,
      history: [],
    };

    try {
      const fileData = await readFile(dataPath, "utf-8");
      const parsedData = JSON.parse(fileData) as Partial<{
        diameter: number;
        history: HistoryEntry[];
      }>;

      data = {
        diameter:
          typeof parsedData.diameter === "number" ? parsedData.diameter : d,
        history: Array.isArray(parsedData.history) ? parsedData.history : [],
      };
    } catch {
      // Use the default structure when the file does not exist yet.
    }

    const newEntry: HistoryEntry = {
      timestamp: captureDate.toISOString(),
      image: `/captures/${filename}`,
      nodeId,
      h,
      d,
      diff,
    };

    data.diameter = d;
    data.history.unshift(newEntry);

    await writeFile(dataPath, JSON.stringify(data, null, 2));

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to process upload" },
      { status: 500 },
    );
  }
}

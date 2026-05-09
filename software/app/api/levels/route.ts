import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";

type NodeLevel = {
  id: string;
  level: number;
};

function isNodeLevel(value: unknown): value is NodeLevel {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.level === "number";
}

export async function GET() {
  const levelsPath = join(process.cwd(), "public", "levels.json");

  try {
    const raw = await readFile(levelsPath, "utf-8");
    const json = JSON.parse(raw) as unknown;
    return NextResponse.json(json);
  } catch {
    return NextResponse.json([
      { id: "node_1", level: 10.7 },
      { id: "node_2", level: 12.3 },
    ] satisfies NodeLevel[]);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;

    if (!Array.isArray(body) || !body.every(isNodeLevel)) {
      return NextResponse.json(
        { error: "Expected an array of { id, level }" },
        { status: 400 },
      );
    }

    const levelsPath = join(process.cwd(), "public", "levels.json");
    await writeFile(levelsPath, JSON.stringify(body, null, 2));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Levels POST Error:", error);
    return NextResponse.json(
      { error: "Failed to process levels" },
      { status: 500 },
    );
  }
}

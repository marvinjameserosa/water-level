import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MASTER_IP = process.env.MASTER_IP || "http://192.168.4.1";

export async function GET() {
  try {
    // The timestamp cache-buster and 5s timeout are perfect
    const res = await fetch(`${MASTER_IP}/api/state?ts=${Date.now()}`, { 
      cache: "no-store", 
      signal: AbortSignal.timeout(5000) 
    });
    
    if (!res.ok) {
      return NextResponse.json(
        { error: `Master AP returned status ${res.status}` }, 
        { status: res.status }
      );
    }

    const json = await res.json();
    
    // Safely map the "system" object from the Pico to the format your UI expects
    return NextResponse.json({ 
      batteryPercentage: json.system?.percentage || 0, 
      batteryVoltage: json.system?.voltage || 0 
    });

  } catch (error) {
    console.error("Battery API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch battery state" },
      { status: 500 }
    );
  }
}
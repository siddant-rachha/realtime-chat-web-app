/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/brave/search/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const apiKey = process.env.BRAVE_API_KEY || "BSAztERnkyR27uvUAyMtyGHW6V4hlw7";

    const res = await fetch(
      `https://api.search.brave.com/res/v1/images/search?q=${encodeURIComponent(query)}&safesearch=off`,
      {
        headers: {
          Accept: "application/json",
          "X-Subscription-Token": apiKey,
        },
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Brave API error: ${text}`);
    }

    const data = await res.json();

    return NextResponse.json({ images: data.results || [] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

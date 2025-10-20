import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Fetch profile data from DB
    const snapshot = await adminDb.ref(`users/${uid}`).get();

    if (!snapshot.exists()) {
      return NextResponse.json({ profile: null });
    }

    const profile = snapshot.val();

    return NextResponse.json({ profile });
  } catch (err) {
    console.error("Error in getProfile:", err);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

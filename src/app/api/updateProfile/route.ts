import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken, displayName, username } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify token to get UID
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Update only displayName field
    await adminDb.ref(`users/${uid}`).update({
      username: username || "",
      displayName: displayName || "",
      updatedAt: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in updateProfile:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

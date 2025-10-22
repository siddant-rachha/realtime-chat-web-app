import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import { ServerValue } from "firebase-admin/database";

export async function POST(req: NextRequest) {
  try {
    const { idToken, displayName, username } = await req.json();
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify token to get UID
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const usernameRegex = /^[a-zA-Z0-9._]{1,25}$/;
    // Validate username format
    if (username && !usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            "Invalid username. Only letters, numbers, underscores, dots allowed. Cannot end with dot or have consecutive dots. Max 25 characters.",
        },
        { status: 400 },
      );
    }
    if (displayName && displayName.length > 25) {
      return NextResponse.json(
        {
          error: "Invalid display name. Max 25 characters.",
        },
        { status: 400 },
      );
    }
    await adminDb.ref(`users/${uid}`).update({
      username: username || "",
      displayName: displayName || "",
      updatedAt: ServerValue.TIMESTAMP,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error in updateProfile:", err);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

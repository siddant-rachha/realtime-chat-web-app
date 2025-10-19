/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

// Regex for Instagram-style usernames
const usernameRegex = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/;

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Get ID token from Authorization header
    const idToken = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Parse request body
    const { displayName, username } = await req.json();
    if (!displayName || !username) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 3️⃣ Validate username format
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        {
          error:
            "Invalid username. Only letters, numbers, underscores, dots allowed. Cannot end with dot or have consecutive dots. Max 30 characters.",
        },
        { status: 400 },
      );
    }

    // 4️⃣ Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || "";
    const photoURL = decodedToken.picture || "";

    // 5️⃣ Check if username already exists
    const usernameSnap = await adminDb.ref(`usernames/${username}`).get();
    if (usernameSnap.exists()) {
      return NextResponse.json({ error: "Username already taken" }, { status: 400 });
    }

    // 6️⃣ Prepare user data
    const userData = {
      displayName,
      username,
      email,
      photoURL,
      lastSeen: Date.now(),
      friends: {},
      createdAt: Date.now(),
    };

    // 7️⃣ Atomic write: user + username index
    const updates: Record<string, any> = {};
    updates[`/users/${uid}`] = userData;
    updates[`/usernames/${username}`] = { uid };

    await adminDb.ref().update(updates);

    // 8️⃣ Success
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "../../../lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken, displayName, username } = await req.json();

    if (!idToken || !displayName || !username) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email || "";
    const photoURL = decodedToken.picture || "";

    // Check if username already exists
    const usernameSnap = await adminDb.ref(`usernames/${username}`).get();
    if (usernameSnap.exists()) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 },
      );
    }

    const userData = {
      displayName,
      username,
      email,
      photoURL,
      lastSeen: Date.now(),
      friends: {},
      createdAt: Date.now(),
    };

    // Write user and username atomically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    updates[`/users/${uid}`] = userData;
    updates[`/usernames/${username}`] = { uid };

    await adminDb.ref().update(updates);

    return NextResponse.json({ success: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 },
    );
  }
}

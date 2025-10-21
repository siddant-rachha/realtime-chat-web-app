import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { username, userUid } = await req.json();
  if (!username && !userUid) return NextResponse.json({ user: null });

  if (username) {
    const snap = await adminDb.ref(`usernames/${username}`).get();
    if (!snap.exists()) return NextResponse.json({ user: null });
    const uid = snap.val().uid;
    const userSnap = await adminDb.ref(`users/${uid}`).get();
    if (!userSnap.exists()) return NextResponse.json({ user: null });

    const user = userSnap.val();
    return NextResponse.json({
      user: { uid, displayName: user.displayName, username: user.username },
    });
  }
  if (userUid) {
    const userSnap = await adminDb.ref(`users/${userUid}`).get();
    if (!userSnap.exists()) return NextResponse.json({ user: null });

    const user = userSnap.val();
    return NextResponse.json({
      user: { uid: userUid, displayName: user.displayName, username: user.username },
    });
  }
  return NextResponse.json({ user: null });
}

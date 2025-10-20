import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const snapshot = await adminDb.ref(`users/${uid}/friends`).get();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const friendsData: Record<string, any> = snapshot.val() || {};

    const friends: { uid: string; displayName: string; username: string }[] = [];
    for (const friendUid in friendsData) {
      const friendSnap = await adminDb.ref(`users/${friendUid}`).get();
      if (friendSnap.exists()) {
        const friend = friendSnap.val();
        friends.push({
          uid: friendUid,
          displayName: friend.displayName,
          username: friend.username,
        });
      }
    }

    return NextResponse.json({ friends });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ friends: [] });
  }
}

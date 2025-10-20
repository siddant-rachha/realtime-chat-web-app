// /api/addFriend.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken, friendUid } = await req.json();
    if (!idToken || !friendUid) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Verify token
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    if (uid === friendUid) {
      return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
    }

    const timestamp = Date.now();

    // Deterministic chatId
    const chatId = [uid, friendUid].sort().join("_");

    // Prepare updates for both users
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};

    // Add each other as friends
    updates[`users/${uid}/friends/${friendUid}`] = true;
    updates[`users/${friendUid}/friends/${uid}`] = true;

    // Create empty chat list entries
    updates[`chatList/${uid}/${chatId}`] = {
      lastMessage: "",
      lastTimestamp: timestamp,
      friendUid,
    };
    updates[`chatList/${friendUid}/${chatId}`] = {
      lastMessage: "",
      lastTimestamp: timestamp,
      friendUid: uid,
    };

    await adminDb.ref().update(updates);

    return NextResponse.json({ success: true, chatId });
  } catch (err) {
    console.error("Error in addFriend:", err);
    return NextResponse.json({ error: "Failed to add friend" }, { status: 500 });
  }
}

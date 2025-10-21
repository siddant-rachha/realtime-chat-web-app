/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/getChats.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ chats: [] });

    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    const chatSnap = await adminDb.ref(`chatList/${uid}`).get();
    if (!chatSnap.exists()) return NextResponse.json({ chatList: [] });

    const chatData = chatSnap.val();

    // Prepare chat items with friend info
    const chatList = await Promise.all(
      Object.entries(chatData).map(async ([chatId, chat]: any) => {
        const friendUid = chat.friendUid;
        const friendSnap = await adminDb.ref(`users/${friendUid}`).get();
        const friendData = friendSnap.val();
        return {
          chatId,
          friendUid,
          displayName: friendData?.displayName || "Unknown",
          username: friendData?.username || "",
          lastMessage: chat.lastMessage || "",
        };
      }),
    );

    return NextResponse.json({ chatList });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ chatList: [] }, { status: 500 });
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";
import { ServerValue } from "firebase-admin/database";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Get Firebase ID token
    const idToken = req.headers.get("Authorization")?.split("Bearer ")[1];
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️⃣ Parse body
    const { chatId, text } = await req.json();
    if (!chatId || !text?.trim()) {
      return NextResponse.json({ error: "Missing chatId or message text" }, { status: 400 });
    }

    // 3️⃣ Verify ID token
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // 4️⃣ Determine friendUid (other user)
    const friendUid = chatId.split("_").find((id: any) => id !== uid);
    if (!friendUid) {
      return NextResponse.json({ error: "Invalid chatId" }, { status: 400 });
    }

    // 5️⃣ Prepare message data
    const newMsgRef = adminDb.ref(`chats/${chatId}`).push();
    const messageData = {
      senderUid: uid,
      text: text.trim(),
      timestamp: ServerValue.TIMESTAMP, // 🔹 authoritative server time
      status: { [friendUid]: "sent" },
      edited: false,
      deleted: false,
    };

    // 6️⃣ Prepare chatList updates
    const chatListUpdates: Record<string, any> = {};
    chatListUpdates[`chatList/${uid}/${chatId}`] = {
      lastMessage: text.trim(),
      lastTimestamp: ServerValue.TIMESTAMP,
      friendUid,
    };
    chatListUpdates[`chatList/${friendUid}/${chatId}`] = {
      lastMessage: text.trim(),
      lastTimestamp: ServerValue.TIMESTAMP,
      friendUid: uid,
    };

    // 7️⃣ Atomic write — message + chatList
    await adminDb.ref().update({
      [`chats/${chatId}/${newMsgRef.key}`]: messageData,
      ...chatListUpdates,
    });

    // 8️⃣ Respond success
    return NextResponse.json({ success: true, messageId: newMsgRef.key });
  } catch (err: any) {
    console.error("Error in sendMessage:", err);
    return NextResponse.json({ error: err.message || "Failed to send message" }, { status: 500 });
  }
}

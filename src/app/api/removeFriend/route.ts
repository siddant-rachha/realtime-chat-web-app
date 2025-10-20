import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  const { idToken, friendUid } = await req.json();
  const decoded = await adminAuth.verifyIdToken(idToken);
  const uid = decoded.uid;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  updates[`users/${uid}/friends/${friendUid}`] = null;
  updates[`users/${friendUid}/friends/${uid}`] = null;

  await adminDb.ref().update(updates);
  return NextResponse.json({ success: true });
}

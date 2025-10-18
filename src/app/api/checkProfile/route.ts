// app/api/checkProfile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();
    if (!idToken) return NextResponse.json({ exists: false });

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const snapshot = await adminDb.ref(`users/${uid}`).get();
    return NextResponse.json({ exists: snapshot.exists() });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ exists: false });
  }
}

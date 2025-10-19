// app/api/checkProfile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Get the Authorization header
    const authHeader = req.headers.get("authorization");

    // 2️⃣ Extract the token (Bearer <token>)
    const idToken = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!idToken) {
      return NextResponse.json({ exists: false, error: "Missing token" });
    }

    // 3️⃣ Verify token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // 4️⃣ Check if user exists in database
    const snapshot = await adminDb.ref(`users/${uid}`).get();
    const userExists = snapshot.exists();

    return NextResponse.json({ exists: userExists });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ exists: false });
  }
}

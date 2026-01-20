import { NextRequest, NextResponse } from "next/server";
import { updateAddress } from "@/lib/address-api";

export async function POST(request: NextRequest) {
  const { documentId } = await request.json();

  if (!documentId) {
    return NextResponse.json({ message: "documentId required" }, { status: 400 });
  }

  const result = await updateAddress(documentId, { isDefault: true });

  if (result.error) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json(result.data);
}

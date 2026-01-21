import { NextRequest, NextResponse } from "next/server";
import { createAddress, updateAddress, deleteAddress } from "@/lib/address-api";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { documentId, ...data } = body;

  const result = await createAddress(data);

  if (result.error) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json(result.data);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { documentId, ...data } = body;

  if (!documentId) {
    return NextResponse.json({ message: "documentId required" }, { status: 400 });
  }

  const result = await updateAddress(documentId, data);

  if (result.error) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json(result.data);
}

export async function DELETE(request: NextRequest) {
  const documentId = request.nextUrl.searchParams.get("documentId");

  console.log("[DELETE /api/addresses] documentId:", documentId);

  if (!documentId) {
    return NextResponse.json({ message: "documentId required" }, { status: 400 });
  }

  const result = await deleteAddress(documentId);
  console.log("[DELETE /api/addresses] result:", result);

  if (result.error) {
    return NextResponse.json({ message: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Customer from "@/models/customer";
import { customerSchema } from "@/lib/validation/customer";

export async function GET() {
  await connectDB();
  const list = await Customer.find().sort({ createdAt: -1 }).limit(500).lean();
  return NextResponse.json(list);
}

export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "ValidationError", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const created = await Customer.create(parsed.data);
  return NextResponse.json(created, { status: 201 });
}

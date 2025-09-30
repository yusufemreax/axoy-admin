import { NextResponse } from "next/server"
import cloudinary from "@/lib/cloudinary"

export async function POST(req: Request) {
  const body = await req.json()
  const { file } = body // base64 string geliyor

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      folder: "products", // cloudinary klasörü
    })

    return NextResponse.json({ url: uploadResponse.secure_url })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}

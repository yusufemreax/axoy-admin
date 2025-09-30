import mongoose from "mongoose";

let isConnected = 0;

export async function connectDB() {
    if(isConnected) return;
    const uri = process.env.MONGODB_URI!;
    if(!uri) throw new Error("MONGODB_URI missing in .env.local");

    const conn = await mongoose.connect(uri);
    isConnected = conn.connection.readyState;
}
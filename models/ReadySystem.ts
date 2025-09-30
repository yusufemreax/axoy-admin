import mongoose, { Schema, Document } from "mongoose"

export interface ISystemProduct {
  image: string
  type: string
  brand: string
  model: string
  unitPrice: number
  qty: number
  commissionRate: number
  unitCommission: number
  totalCommission: number
  totalPrice: number
}

export interface IReadySystem extends Document {
  name: string
  products: ISystemProduct[]
  productTotal: number
  totalCommission: number
  laborCost: number
  travelCost: number
  customerPrice: number
  profit: number
}

const SystemProductSchema = new Schema<ISystemProduct>(
  {
    image: String,
    type: String,
    brand: String,
    model: String,
    unitPrice: Number,
    qty: Number,
    commissionRate: Number,
    unitCommission: Number,
    totalCommission: Number,
    totalPrice: Number,
  },
  { _id: false }
)

const ReadySystemSchema = new Schema<IReadySystem>(
  {
    name: { type: String, required: true },
    products: [SystemProductSchema],
    productTotal: Number,
    totalCommission: Number,
    laborCost: Number,
    travelCost: { type: Number, default: 0 },
    customerPrice: Number,
    profit: Number,
  },
  { timestamps: true }
)

export default mongoose.models.ReadySystem ||
  mongoose.model<IReadySystem>("ReadySystem", ReadySystemSchema)

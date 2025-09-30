import { Schema, model, models } from "mongoose";

const CustomerProductSchema = new Schema(
  {
    // system-builder'daki satır yapınızla birebir uyumlu
    _id: { type: Schema.Types.Mixed },     // product id (string) gelebilir
    localId: { type: String },             // UI içi benzersiz anahtar
    image: { type: String },
    type: { type: String, required: true },
    brand: { type: String, required: true },
    model: { type: String, required: true },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    commissionRate: { type: Number, required: true, min: 0 },
    unitCommission: { type: Number, required: true, min: 0 },
    totalCommission: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CustomerSchema = new Schema(
  {
    customerName: { type: String, required: true },
    probability: { type: Number, required: true, min: 0, max: 100 }, // kabul olasılığı %
    jobDate: {type:Date},
    products: { type: [CustomerProductSchema], default: [] },
    productTotal: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    travelCost: { type: Number, default: 0 },
    customerPrice: { type: Number, default: 0 },
    profit: { type: Number, default: 0 },
    status: { type: String, default: "lead" }, // lead | won | lost gibi durumlar için yer
  },
  { timestamps: true }
);

export default models.Customer || model("Customer", CustomerSchema);

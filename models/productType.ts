import { Schema, model, models } from "mongoose";

const ProductTypeSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    fields: [
      {
        key: { type: String, required: true },
        label: { type: String, required: true },
        inputType: { type: String, default: "text" }, // text | number | select
        options: [{ type: String }], // ✅ select için seçenekler
      },
    ],
  },
  { timestamps: true }
);

export default models.ProductType || model("ProductType", ProductTypeSchema);

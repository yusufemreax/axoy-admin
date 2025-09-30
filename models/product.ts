import { Schema, model, models } from "mongoose";

const ProductSchema = new Schema(
    {
        type: { type: String, required: true },     // "amfi" | "hoparlör" | ...
        brand: { type: String, required: true },    // marka
        model: { type: String, required: true },    // modeli
        price: { type: Number, required: true, min: 0 }, // fiyatı (vergisiz/gerekirse brüt)
        specs: { type: Map, of: Schema.Types.Mixed },    // dinamik teknik özellikler
        stock: { type: Number, default: 0, min: 0 },
        minStock: { type: Number, default: 0, min: 0 },
        image: {type: String, required: false},
        sku: { type: String, unique: true, sparse: true },
    },
    {
        timestamps: true
    }
);

ProductSchema.index({ type: 1, brand: 1,model: 1}, {unique: true});

export default models.Product || model("Product",ProductSchema);
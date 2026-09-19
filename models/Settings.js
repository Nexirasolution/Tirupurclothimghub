import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    storeName: { type: String },
    logo: { type: String },
    whatsapp: { type: String },
    instagram: { type: String },
    address: { type: String },

    // Weight-based shipping: admin sets the assumed weight of a single
    // piece (garment/unit) and a price per kg. Total order weight is
    // computed as (total piece count across the cart) * weightPerPiece,
    // then charged at pricePerKg, rounded up to the next whole kg.
    // `shippingFee` is kept only so existing documents aren't broken by
    // the schema change; it is no longer read by the shipping calculator.
    shippingFee: { type: Number, default: 0 },
    weightPerPiece: { type: Number, default: 0 }, // grams, per single piece
    pricePerKg: { type: Number, default: 0 }, // ₹ charged per kg (rounded up)

    // Flat fallback used whenever weight-based shipping can't be computed,
    // i.e. weightPerPiece or pricePerKg is 0.
    defaultShippingCharge: { type: Number, default: 0 },

    freeShippingAbove: { type: Number, default: 0 }, // order subtotal (₹) above which shipping is free, regardless of weight
    seoTitle: { type: String },
    seoDescription: { type: String }
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
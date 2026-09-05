import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global' },
    storeName: { type: String, default: 'Lakshmibala Clothing Store' },
    logo: { type: String, default: '' },
    whatsapp: { type: String, default: '918524858771' },
    instagram: { type: String, default: 'Lakshmibala_Clothing Store' },
    address: { type: String, default: 'Sivakasi, Virudhunagar Dt, Tamil Nadu' },

    // Weight-based shipping: admin sets the assumed weight of a single
    // piece (garment/unit) and a price per kg. Total order weight is
    // computed as (total piece count across the cart) * weightPerPiece,
    // then charged at pricePerKg, rounded up to the next whole kg.
    // `shippingFee` is kept only so existing documents aren't broken by
    // the schema change; it is no longer read by the shipping calculator.
    shippingFee: { type: Number, default: 49 },
    weightPerPiece: { type: Number, default: 250 }, // grams, per single piece
    pricePerKg: { type: Number, default: 60 }, // ₹ charged per kg (rounded up)

    // Flat fallback used whenever weight-based shipping can't be computed —
    // i.e. weightPerPiece or pricePerKg is left at 0/unset. Keeps shipping
    // from silently coming out as ₹0 if the admin hasn't configured weight yet.
    defaultShippingCharge: { type: Number, default: 49 },

    freeShippingAbove: { type: Number, default: 999 }, // order subtotal (₹) above which shipping is free, regardless of weight
    seoTitle: { type: String, default: 'Lakshmibala Clothing Store - Women Kurtis, Innerwear & More' },
    seoDescription: { type: String, default: 'Shop trendy women kurtis, nighties, 2 piece sets and innerwear online from Lakshmibala Clothing Store, Sivakasi.' }
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);
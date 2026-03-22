import mongoose, { Schema, Document, Model } from "mongoose";

/* ── Spec entry ─────────────────────────────────────────────────────────── */
export interface ISpec {
  label: string;
  value: string;
}

/* ── Phone document ─────────────────────────────────────────────────────── */
export interface IPhone extends Document {
  name: string;
  slug: string;
  brand: string;
  /** Lowercase folder name, e.g. "samsung" */
  brandSlug: string;
  /** Display price string, e.g. "৳ 1,59,999" */
  price: string;
  /** Parsed numeric price for sorting */
  priceNum: number;
  /**
   * Image URL.  For API phones this may be an absolute URL returned by the
   * admin form.  Falls back to the placeholder if blank.
   */
  image: string;
  released: string;
  category: string;
  tags: string[];
  specs: ISpec[];
  description: string;
  /** Always "api" for DB-sourced phones */
  source: "api";
  /** Pinned to top of listings */
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SpecSchema = new Schema<ISpec>(
  { label: { type: String, required: true }, value: { type: String, default: "" } },
  { _id: false }
);

const PhoneSchema = new Schema<IPhone>(
  {
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, trim: true, lowercase: true },
    brand:       { type: String, required: true, trim: true },
    brandSlug:   { type: String, required: true, trim: true, lowercase: true },
    price:       { type: String, required: true, default: "N/A" },
    priceNum:    { type: Number, default: 0 },
    image:       { type: String, default: "/images/phones/placeholder-phone.svg" },
    released:    { type: String, default: "N/A" },
    category:    { type: String, default: "phone", enum: ["phone", "tablet", "watch"] },
    tags:        [{ type: String }],
    specs:       [SpecSchema],
    description: { type: String, default: "" },
    source:      { type: String, default: "api" },
    featured:    { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* Indexes for common query patterns */
PhoneSchema.index({ slug: 1 });
PhoneSchema.index({ brandSlug: 1, category: 1 });
PhoneSchema.index({ priceNum: 1 });
PhoneSchema.index({ featured: -1, createdAt: -1 });
PhoneSchema.index({ name: "text", brand: "text", description: "text" });

export const PhoneModel: Model<IPhone> =
  mongoose.models.Phone ?? mongoose.model<IPhone>("Phone", PhoneSchema);

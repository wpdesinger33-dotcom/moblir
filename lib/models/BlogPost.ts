import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  image: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title:     { type: String, required: true, trim: true },
    slug:      { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt:   { type: String, default: "" },
    content:   { type: String, required: true },
    date:      { type: String, required: true },
    author:    { type: String, default: "GadgetPriceBD Team" },
    category:  { type: String, default: "General" },
    tags:      [{ type: String }],
    image:     { type: String, default: "" },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

BlogPostSchema.index({ slug: 1 });
BlogPostSchema.index({ published: 1, date: -1 });
BlogPostSchema.index({ category: 1 });
BlogPostSchema.index({ title: "text", content: "text", tags: "text" });

export const BlogPostModel: Model<IBlogPost> =
  mongoose.models.BlogPost ?? mongoose.model<IBlogPost>("BlogPost", BlogPostSchema);

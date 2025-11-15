import mongoose, { Schema, model, models } from 'mongoose';

const WishlistItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Products', required: true },
  addedAt: { type: Date, default: Date.now }
});

const WishlistSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: { type: [WishlistItemSchema], default: [] }
}, { timestamps: true });

export default models.Wishlist || model('Wishlist', WishlistSchema);
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Wishlist from '@/models/Wishlist';
import mongoose from 'mongoose';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  await dbConnect();
  const wl = await Wishlist.findOne({ userId }).populate('items.productId');
  return NextResponse.json(wl || { items: [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { userId, productId } = body;
  if (!userId || !productId) return NextResponse.json({ error: 'userId and productId required' }, { status: 400 });
  await dbConnect();
  const oid = new mongoose.Types.ObjectId(productId);
  const wl = await Wishlist.findOneAndUpdate(
    { userId },
    { $addToSet: { items: { productId: oid } } },
    { upsert: true, new: true }
  );
  return NextResponse.json(wl);
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const { userId, productId } = body;
  if (!userId || !productId) return NextResponse.json({ error: 'userId and productId required' }, { status: 400 });
  await dbConnect();
  const wl = await Wishlist.findOneAndUpdate(
    { userId },
    { $pull: { items: { productId: new mongoose.Types.ObjectId(productId) } } },
    { new: true }
  );
  return NextResponse.json(wl);
}
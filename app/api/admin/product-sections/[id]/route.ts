import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { ProductSection } from '@/models/ContentBlocks';

// GET - Fetch single product section by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    const productSection = await ProductSection.findById(id);
    
    if (!productSection) {
      return NextResponse.json(
        { success: false, error: 'Product section not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: productSection
    });
  } catch (error) {
    console.error('Error fetching product section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product section' },
      { status: 500 }
    );
  }
}

// PUT - Update product section by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.title || !data.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, title, type' },
        { status: 400 }
      );
    }

    // Check if slug already exists (excluding current document)
    if (data.slug) {
      const existingSection = await ProductSection.findOne({ 
        slug: data.slug, 
        _id: { $ne: id } 
      });
      
      if (existingSection) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }

    // Process productIds to ensure they're valid ObjectIds
    let processedProductIds = [];
    if (data.productSelection?.productIds) {
      processedProductIds = Array.isArray(data.productSelection.productIds) 
        ? data.productSelection.productIds.filter((id: any) => id && typeof id === 'string')
        : [];
    }

    const updatedSection = await ProductSection.findByIdAndUpdate(
      id,
      {
        name: data.name,
        slug: data.slug,
        title: data.title,
        description: data.description || '',
        type: data.type,
        productSelection: {
          method: data.productSelection?.method || 'automatic',
          productIds: processedProductIds,
          criteria: {
            category: data.productSelection?.criteria?.category,
            tags: data.productSelection?.criteria?.tags || [],
            sortBy: data.productSelection?.criteria?.sortBy || 'newest',
            limit: data.productSelection?.criteria?.limit || 8
          }
        },
        displaySettings: {
          showTitle: data.displaySettings?.showTitle !== undefined ? data.displaySettings.showTitle : true,
          showDescription: data.displaySettings?.showDescription !== undefined ? data.displaySettings.showDescription : true,
          showPrice: data.displaySettings?.showPrice !== undefined ? data.displaySettings.showPrice : true,
          showRating: data.displaySettings?.showRating !== undefined ? data.displaySettings.showRating : true,
          layout: data.displaySettings?.layout || 'grid',
          itemsPerRow: data.displaySettings?.itemsPerRow || 4
        },
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive !== undefined ? data.isActive : true
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedSection) {
      return NextResponse.json(
        { success: false, error: 'Product section not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedSection
    });
  } catch (error) {
    console.error('Error updating product section:', error);
    
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update product section' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product section by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    
    const deletedSection = await ProductSection.findByIdAndDelete(id);
    
    if (!deletedSection) {
      return NextResponse.json(
        { success: false, error: 'Product section not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Product section deleted successfully',
      data: deletedSection
    });
  } catch (error) {
    console.error('Error deleting product section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product section' },
      { status: 500 }
    );
  }
}
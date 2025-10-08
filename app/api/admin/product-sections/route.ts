import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { ProductSection } from '@/models/ContentBlocks';

// GET - Fetch all product sections
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('active');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');
    
    // Build query filter
    const filter: any = {};
    if (isActive !== null) {
      filter.isActive = isActive === 'true';
    }
    if (type) {
      filter.type = type;
    }
    
    // Build query
    let query = ProductSection.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    
    // Apply limit if provided
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const productSections = await query.exec();
    
    return NextResponse.json({
      success: true,
      data: productSections,
      count: productSections.length
    });
  } catch (error) {
    console.error('Error fetching product sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product sections' },
      { status: 500 }
    );
  }
}

// POST - Create new product section
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.title || !data.type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, title, type' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    if (data.slug) {
      const existingSection = await ProductSection.findOne({ slug: data.slug });
      if (existingSection) {
        return NextResponse.json(
          { success: false, error: 'Slug already exists' },
          { status: 400 }
        );
      }
    }
    
    // Generate slug if not provided
    let slug = data.slug;
    if (!slug && data.name) {
      slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    
    // Process productIds to ensure they're valid
    let processedProductIds = [];
    if (data.productSelection?.productIds) {
      processedProductIds = Array.isArray(data.productSelection.productIds) 
        ? data.productSelection.productIds.filter((id: any) => id && typeof id === 'string')
        : [];
    }

    // Create new product section
    const productSection = new ProductSection({
      name: data.name,
      slug: slug,
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
    });

    const savedSection = await productSection.save();
    
    return NextResponse.json({
      success: true,
      data: savedSection
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product section:', error);
    
    // Handle duplicate key error (slug)
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create product section' },
      { status: 500 }
    );
  }
}

// PUT - Bulk update product sections (e.g., reorder)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    const { sections } = await request.json();
    
    if (!Array.isArray(sections)) {
      return NextResponse.json(
        { success: false, error: 'Sections must be an array' },
        { status: 400 }
      );
    }
    
    // Bulk update sort orders
    const bulkOps = sections.map((section, index) => ({
      updateOne: {
        filter: { _id: section._id },
        update: { sortOrder: index }
      }
    }));
    
    await ProductSection.bulkWrite(bulkOps);
    
    return NextResponse.json({
      success: true,
      message: 'Product sections updated successfully'
    });
  } catch (error) {
    console.error('Error bulk updating product sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product sections' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import { Product } from '@/models/Products';
import Category from '@/models/Categories';

// GET - Fetch products for admin (includes all statuses)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const sortBy = searchParams.get('sortBy') || 'newest';
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const isNew = searchParams.get('isNew');
    const isSale = searchParams.get('isSale');
    
    // Build filter object
    const filter: any = {};
    
    // Status filter (admin can see all statuses)
    if (status) {
      filter.status = status;
    }
    
    // Category filter
    if (category) {
      filter.category = category;
    }
    
    // Boolean filters
    if (featured === 'true') {
      filter.featured = true;
    }
    if (isNew === 'true') {
      filter.isNew = true;
    }
    if (isSale === 'true') {
      filter.isSale = true;
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case 'newest':
        sort = { createdAt: -1 };
        break;
      case 'oldest':
        sort = { createdAt: 1 };
        break;
      case 'name':
        sort = { name: 1 };
        break;
      case 'price-low':
        sort = { price: 1 };
        break;
      case 'price-high':
        sort = { price: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Execute query with population
    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching products (admin):', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.description || !data.price || !data.category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, description, price, category' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    if (data.slug) {
      const existingProduct = await Product.findOne({ slug: data.slug });
      if (existingProduct) {
        return NextResponse.json(
          { success: false, error: 'A product with this slug already exists' },
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
        
      // Check if generated slug exists
      const existingProduct = await Product.findOne({ slug });
      if (existingProduct) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Ensure at least one image has isPrimary set
    if (data.images && data.images.length > 0) {
      const hasPrimary = data.images.some((img: any) => img.isPrimary);
      if (!hasPrimary) {
        data.images[0].isPrimary = true;
      }
    }

    // Filter out empty specifications
    if (data.specifications) {
      data.specifications = data.specifications.filter(
        (spec: any) => spec.name?.trim() && spec.value?.trim()
      );
    }

    // Handle variants - only include if we have valid variants
    const productData: any = {
      ...data,
      slug,
      tags: data.tags?.map((tag: string) => tag.toLowerCase()) || [],
      seo: {
        title: data.seo?.title || data.name,
        description: data.seo?.description || data.shortDescription || data.description.substring(0, 160),
        keywords: data.seo?.keywords || []
      }
    };

    // Only add variants if we have valid ones with SKUs
    if (data.variants && Array.isArray(data.variants)) {
      const validVariants = data.variants.filter((variant: any) => 
        variant.name?.trim() && variant.price > 0 && variant.sku?.trim()
      );
      if (validVariants.length > 0) {
        productData.variants = validVariants;
      }
    }
    
    // Explicitly exclude variants if not provided to avoid index issues
    if (!productData.variants) {
      delete productData.variants;
    }

    // Create new product
    const product = new Product(productData);
    const savedProduct = await product.save();
    
    // Populate the response
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug');
    
    return NextResponse.json({
      success: true,
      data: populatedProduct
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle duplicate key error (slug)
    if ((error as any).code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Product with this slug already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
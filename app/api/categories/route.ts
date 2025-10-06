import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Category from '@/models/Categories';

// MongoDB connection
async function connectDB() {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/next-commerce');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parent');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const limit = parseInt(searchParams.get('limit') || '0');

    // Build query
    let query: any = {};
    
    if (!includeInactive) {
      query.isActive = true;
    }

    if (parentId) {
      query.parentCategory = parentId;
    } else if (parentId === null || searchParams.has('parent')) {
      query.parentCategory = null; // Get only top-level categories
    }

    // Fetch categories with population
    let categoriesQuery = Category.find(query)
      .populate({
        path: 'parentCategory',
        select: 'name slug _id',
        match: { isActive: true }
      })
      .populate({
        path: 'subcategories',
        select: 'name slug _id description image sortOrder',
        match: { isActive: true },
        options: { sort: { sortOrder: 1, name: 1 } }
      })
      .sort({ sortOrder: 1, name: 1 });

    if (limit > 0) {
      categoriesQuery = categoriesQuery.limit(limit);
    }

    const categories = await categoriesQuery.exec();

    return NextResponse.json({
      success: true,
      message: 'Categories retrieved successfully',
      categories,
      count: categories.length
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const {
      name,
      slug,
      description,
      image,
      parentCategory,
      isActive,
      sortOrder,
      seoTitle,
      seoDescription
    } = body;

    // Validation
    if (!name || !slug) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Name and slug are required' 
        },
        { status: 400 }
      );
    }

    // Check if category with same name or slug already exists
    const existingCategory = await Category.findOne({
      $or: [{ name }, { slug }]
    });

    if (existingCategory) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Category with this name or slug already exists' 
        },
        { status: 409 }
      );
    }

    // Validate parent category if provided
    if (parentCategory) {
      const parentExists = await Category.findById(parentCategory);
      if (!parentExists) {
        return NextResponse.json(
          {
            success: false,
            message: 'Parent category not found'
          },
          { status: 400 }
        );
      }
    }

    // Create new category
    const categoryData = {
      _id: new mongoose.Types.ObjectId(),
      name: name.trim(),
      slug: slug.toLowerCase().trim(),
      description: description?.trim() || '',
      image: image || '',
      parentCategory: parentCategory || null,
      isActive: isActive ?? true,
      sortOrder: sortOrder || 0,
      seoTitle: seoTitle?.trim() || '',
      seoDescription: seoDescription?.trim() || ''
    };

    const category = new Category(categoryData);
    const savedCategory = await category.save();

    // If this category has a parent, add it to parent's subcategories
    if (parentCategory) {
      await Category.findByIdAndUpdate(
        parentCategory,
        { $addToSet: { subcategories: savedCategory._id } }, // Use $addToSet to prevent duplicates
        { new: true }
      );
    }

    // Populate the saved category for response
    const populatedCategory = await Category.findById(savedCategory._id)
      .populate('parentCategory', 'name slug _id')
      .populate('subcategories', 'name slug _id');

    return NextResponse.json(
      {
        success: true,
        message: 'Category created successfully',
        category: populatedCategory
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating category:', error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Validation error', 
          errors: Object.keys(error.errors).map(key => ({
            field: key,
            message: error.errors[key].message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to create category',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE method to remove a category
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('id');

    if (!categoryId) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Category ID is required' 
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Category not found' 
        },
        { status: 404 }
      );
    }

    // Check if category has subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Cannot delete category with subcategories. Delete subcategories first.' 
        },
        { status: 400 }
      );
    }

    // Remove from parent's subcategories array if it has a parent
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(
        category.parentCategory,
        { $pull: { subcategories: categoryId } }
      );
    }

    // Delete the category
    await Category.findByIdAndDelete(categoryId);

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to delete category',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
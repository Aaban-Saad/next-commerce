'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: {
    name: string;
  };
  isNew?: boolean;
  isSale?: boolean;
  rating?: number;
}

interface ProductSection {
  _id: string;
  name: string;
  title: string;
  description?: string;
  type: string;
  productSelection: {
    method: 'manual' | 'automatic';
    productIds: string[];
    criteria: {
      category?: string;
      tags: string[];
      sortBy: string;
      limit: number;
    };
  };
  displaySettings: {
    showTitle: boolean;
    showDescription: boolean;
    showPrice: boolean;
    showRating: boolean;
    layout: 'grid' | 'carousel';
    itemsPerRow: number;
  };
  sortOrder: number;
  isActive: boolean;
}

// Fallback products for demo purposes
const fallbackProducts = [
  {
    _id: '1',
    name: "Silk Midi Dress",
    price: 299,
    originalPrice: 399,
    images: ["/elegant-silk-midi-dress.jpg"],
    category: { name: "Women" },
    isNew: false,
    isSale: true,
  },
  {
    _id: '2',
    name: "Cashmere Sweater",
    price: 189,
    images: ["/luxury-cashmere-sweater.png"],
    category: { name: "Women" },
    isNew: true,
    isSale: false,
  },
  {
    _id: '3',
    name: "Leather Loafers",
    price: 249,
    images: ["/premium-leather-loafers.png"],
    category: { name: "Men" },
    isNew: false,
    isSale: false,
  },
  {
    _id: '4',
    name: "Wool Blazer",
    price: 349,
    originalPrice: 449,
    images: ["/tailored-wool-blazer.jpg"],
    category: { name: "Men" },
    isNew: false,
    isSale: true,
  },
];

function ProductCard({ product, displaySettings }: { product: Product; displaySettings: any }) {
  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative overflow-hidden">
        <img
          src={product.images?.[0] || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.isNew && (
            <Badge variant="secondary" className="text-xs">
              New
            </Badge>
          )}
          {product.isSale && (
            <Badge variant="destructive" className="text-xs">
              Sale
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="h-8 w-8">
            <Heart className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" className="h-8">
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="text-sm text-muted-foreground mb-1">{product.category?.name}</div>
        <Link href={`/product/${product._id}`}>
          <h3 className="font-medium mb-2 hover:underline">
            {displaySettings.showTitle ? product.name : product.name}
          </h3>
        </Link>
        {displaySettings.showPrice && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
            )}
          </div>
        )}
        {displaySettings.showRating && product.rating && (
          <div className="flex items-center mt-1">
            <span className="text-sm text-muted-foreground">★ {product.rating}/5</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DynamicProductSections() {
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [sectionProducts, setSectionProducts] = useState<{ [key: string]: Product[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      // Fetch active product sections
      const response = await fetch('/api/admin/product-sections?active=true');
      const result = await response.json();
      
      if (result.success && result.data) {
        const activeSections = result.data.sort((a: ProductSection, b: ProductSection) => a.sortOrder - b.sortOrder);
        setSections(activeSections);
        
        // Fetch products for each section
        for (const section of activeSections) {
          await fetchSectionProducts(section);
        }
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionProducts = async (section: ProductSection) => {
    try {
      // For now, we'll use fallback products since we don't have a products API yet
      // In a real implementation, you would fetch products based on section criteria
      setSectionProducts(prev => ({
        ...prev,
        [section._id]: fallbackProducts.slice(0, section.productSelection.criteria.limit)
      }));
    } catch (error) {
      console.error('Error fetching products for section:', error);
    }
  };

  if (loading) {
    return (
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sections.length === 0) {
    // Fallback to static section if no dynamic sections are configured
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">Featured Products</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our carefully curated selection of premium products that embody timeless elegance and modern sophistication.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {fallbackProducts.map((product) => (
              <ProductCard 
                key={product._id} 
                product={product} 
                displaySettings={{ showTitle: true, showPrice: true, showRating: true }} 
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div>
      {sections.map((section) => {
        const products = sectionProducts[section._id] || [];
        const gridCols = section.displaySettings.itemsPerRow === 2 ? 'lg:grid-cols-2' :
                        section.displaySettings.itemsPerRow === 3 ? 'lg:grid-cols-3' :
                        section.displaySettings.itemsPerRow === 4 ? 'lg:grid-cols-4' :
                        section.displaySettings.itemsPerRow === 5 ? 'lg:grid-cols-5' :
                        'lg:grid-cols-6';

        return (
          <section key={section._id} className="py-16">
            <div className="container mx-auto px-4">
              {section.displaySettings.showTitle && (
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">
                    {section.title}
                  </h2>
                  {section.displaySettings.showDescription && section.description && (
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                      {section.description}
                    </p>
                  )}
                </div>
              )}

              {section.displaySettings.layout === 'grid' ? (
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-6`}>
                  {products.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      displaySettings={section.displaySettings} 
                    />
                  ))}
                </div>
              ) : (
                // Carousel layout - simplified for now
                <div className="flex gap-6 overflow-x-auto pb-4">
                  {products.map((product) => (
                    <div key={product._id} className="flex-none w-80">
                      <ProductCard 
                        product={product} 
                        displaySettings={section.displaySettings} 
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="text-center mt-12">
                <Button size="lg" variant="outline" asChild>
                  <Link href={`/products?section=${section.type}`}>
                    View All {section.title}
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

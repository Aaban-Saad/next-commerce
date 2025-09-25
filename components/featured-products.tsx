import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart } from "lucide-react"

const featuredProducts = [
  {
    id: 1,
    name: "Silk Midi Dress",
    price: 299,
    originalPrice: 399,
    image: "/elegant-silk-midi-dress.jpg",
    category: "Women",
    isNew: false,
    isSale: true,
  },
  {
    id: 2,
    name: "Cashmere Sweater",
    price: 189,
    image: "/luxury-cashmere-sweater.png",
    category: "Women",
    isNew: true,
    isSale: false,
  },
  {
    id: 3,
    name: "Leather Loafers",
    price: 249,
    image: "/premium-leather-loafers.png",
    category: "Men",
    isNew: false,
    isSale: false,
  },
  {
    id: 4,
    name: "Wool Blazer",
    price: 349,
    originalPrice: 449,
    image: "/tailored-wool-blazer.jpg",
    category: "Men",
    isNew: false,
    isSale: true,
  },
  {
    id: 5,
    name: "Designer Handbag",
    price: 599,
    image: "/luxury-designer-handbag.jpg",
    category: "Accessories",
    isNew: true,
    isSale: false,
  },
  {
    id: 6,
    name: "Minimalist Watch",
    price: 199,
    image: "/minimalist-luxury-watch.jpg",
    category: "Accessories",
    isNew: false,
    isSale: false,
  },
]

export function FeaturedProducts() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-light tracking-tight mb-4">Featured Products</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our carefully curated selection of premium products that embody timeless elegance and modern
            sophistication.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative overflow-hidden">
                <img
                  src={product.image || "/placeholder.svg"}
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
                <div className="text-sm text-muted-foreground mb-1">{product.category}</div>
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-medium mb-2 hover:underline">{product.name}</h3>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

import { ProductForm } from "@/components/admin/product-form"

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Product</h1>
        <p className="text-muted-foreground">Create a new product for your store</p>
      </div>

      <ProductForm />
    </div>
  )
}

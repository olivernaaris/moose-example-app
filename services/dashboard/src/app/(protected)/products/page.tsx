"use client";

import { ProductList, CreateProductForm } from "@/features/products";

export default function ProductsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <p className="text-muted-foreground">
          Manage your product catalog.
        </p>
      </div>

      <CreateProductForm />
      <ProductList />
    </div>
  );
}

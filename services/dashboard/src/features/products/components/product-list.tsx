"use client";

import { useProducts } from "@moose-example/api-clients";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export function ProductList() {
  const { data, isLoading, error } = useProducts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load products: {error.message}
      </div>
    );
  }

  const products = data?.items ?? [];

  if (products.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center">
        <p className="text-muted-foreground">
          No products yet. Add your first product above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card key={product.id}>
          <CardHeader>
            <CardTitle className="text-base">{product.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">${product.price}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Stock</span>
              <span className="font-medium">{product.stock}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">SKU</span>
              <span className="font-mono text-xs">{product.sku}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

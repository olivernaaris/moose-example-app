"use client";

import { useState, type FormEvent } from "react";
import { useCreateOrder, useProducts } from "@moose-example/api-clients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export function CreateOrderForm() {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);

  const { data: productsData } = useProducts();
  const createOrder = useCreateOrder();

  const products = productsData?.items ?? [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!productId.trim()) {
      setError("Please enter a product ID");
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    try {
      await createOrder.mutateAsync({
        items: [{ productId: productId.trim(), quantity: qty }],
      });
      setProductId("");
      setQuantity("1");
    } catch {
      setError("Failed to create order");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Create Order</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="productId">Product ID</Label>
            {products.length > 0 ? (
              <select
                id="productId"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              >
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.price})
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="productId"
                type="text"
                placeholder="Enter product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                required
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={createOrder.isPending}>
            {createOrder.isPending ? "Creating..." : "Create Order"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

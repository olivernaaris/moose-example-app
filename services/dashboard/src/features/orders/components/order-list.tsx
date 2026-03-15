"use client";

import { useOrders } from "@moose-example/api-clients";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export function OrderList() {
  const { data, isLoading, error } = useOrders();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
        Failed to load orders: {error.message}
      </div>
    );
  }

  const orders = data?.items ?? [];

  if (orders.length === 0) {
    return (
      <div className="rounded-md border border-border p-8 text-center">
        <p className="text-muted-foreground">
          No orders yet. Create your first order above.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <CardTitle className="text-base">
              Order {order.id.slice(0, 8)}...
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium capitalize">
                {order.status}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">${order.total}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Items</span>
              <span className="font-medium">{order.items.length}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

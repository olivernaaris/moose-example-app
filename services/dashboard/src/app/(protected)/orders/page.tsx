"use client";

import { OrderList, CreateOrderForm } from "@/features/orders";

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
        <p className="text-muted-foreground">
          View and manage customer orders.
        </p>
      </div>

      <CreateOrderForm />
      <OrderList />
    </div>
  );
}

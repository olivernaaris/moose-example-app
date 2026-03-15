import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "../fetch-client.js";
import { orderKeys } from "../query-keys.js";

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: string;
}

interface Order {
  id: string;
  userId: string;
  status: string;
  total: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

interface OrderListResponse {
  items: Order[];
  total: number;
}

interface CreateOrderInput {
  items: Array<{ productId: string; quantity: number }>;
}

export function useOrders(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => client<OrderListResponse>("/api/orders"),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => client<Order>(`/api/orders/${id}`),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrderInput) =>
      client<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      client<Order>(`/api/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: orderKeys.detail(variables.id),
      });
    },
  });
}

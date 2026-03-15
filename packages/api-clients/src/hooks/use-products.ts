import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "../fetch-client.js";
import { productKeys } from "../query-keys.js";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string;
  sku: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductListResponse {
  items: Product[];
  total: number;
}

interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock?: number;
}

export function useProducts(filters: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => client<ProductListResponse>("/api/products"),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => client<Product>(`/api/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProductInput) =>
      client<Product>("/api/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
}

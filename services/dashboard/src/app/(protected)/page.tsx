import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to the Moose Example Dashboard.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/orders" className="block">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Orders</CardTitle>
              <CardDescription>
                View and manage customer orders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create orders, track status, and manage fulfillment.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/products" className="block">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Manage your product catalog.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Add products, update pricing, and track inventory.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

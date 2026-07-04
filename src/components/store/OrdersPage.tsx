"use client";

import { useState, useEffect } from "react";
import { Package, Calendar, CheckCircle2, Clock, Truck, ChevronRight, ShoppingBag } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/pricing";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function OrdersPage() {
  const { auth, settings, navigate } = useAppStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const currency = settings?.currency || "INR";

  const getStepStatus = (status: string) => {
    const steps = ["pending", "processing", "shipped", "delivered"];
    const currentIdx = steps.indexOf(status.toLowerCase());
    return steps.map((s, i) => ({
        label: s.charAt(0).toUpperCase() + s.slice(1),
        isCompleted: i <= currentIdx,
        isCurrent: i === currentIdx
    }));
  };

  useEffect(() => {
    async function fetchOrders() {
      if (!auth.user?.email) return;
      try {
        const res = await fetch(`/api/orders?email=${auth.user.email}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Fetch orders error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [auth.user?.email]);

  if (!auth.user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your orders</h1>
        <Button onClick={() => navigate("home")}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">My Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 w-full bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-muted/30">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">You haven't placed any orders yet.</p>
          <Button variant="link" onClick={() => navigate("products")}>Start shopping</Button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-xl bg-card overflow-hidden transition-shadow hover:shadow-md">
              <div className="bg-muted/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b">
                <div className="flex gap-6 flex-wrap">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Order Placed</p>
                    <p className="text-sm font-medium">{format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Total</p>
                    <p className="text-sm font-medium">{formatPrice(order.totalAmount, currency)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Status</p>
                    <Badge variant="outline" className="mt-0.5">{order.status}</Badge>
                  </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Order #</p>
                    <p className="text-sm font-mono">{order.id.slice(0, 8)}</p>
                </div>
              </div>
              <div className="p-6 space-y-8">
                {/* Order Tracking Stepper */}
                <div className="relative flex justify-between max-w-2xl mx-auto py-4">
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2 z-0" />
                    {getStepStatus(order.status).map((step, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-colors ${step.isCompleted ? 'bg-primary border-primary text-white' : 'bg-background border-muted text-muted-foreground'}`}>
                                {step.isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <div className="h-2 w-2 rounded-full bg-current" />}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${step.isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4 pt-4 border-t">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="flex gap-4">
                            <div className="h-16 w-16 bg-muted rounded-md flex-shrink-0 overflow-hidden border">
                                {item.Product?.images && (
                                    <img
                                        src={(() => {
                                            try {
                                                const imgs = JSON.parse(item.Product.images);
                                                return Array.isArray(imgs) ? imgs[0] : '';
                                            } catch { return ''; }
                                        })()}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm sm:text-base truncate">{item.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                                <p className="text-sm font-medium mt-1">{formatPrice(item.price, currency)}</p>
                            </div>
                            <div className="flex items-center">
                                <Button variant="outline" size="sm" onClick={() => navigate("product-page", item.Product?.slug || item.productId)}>
                                    Buy Again
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

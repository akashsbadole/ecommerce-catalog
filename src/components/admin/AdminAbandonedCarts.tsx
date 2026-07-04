"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Mail, Search, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminFetch } from "@/lib/admin-fetch";
import { formatDistanceToNow } from "date-fns";
import { formatPrice } from "@/lib/pricing";
import { useAppStore } from "@/lib/store";

export function AdminAbandonedCarts() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { settings } = useAppStore();
  const currency = settings?.currency || "INR";

  const [sending, setSending] = useState<string | null>(null);

  const fetchCarts = async () => {
    try {
      const res = await adminFetch("/api/admin/abandoned-carts");
      if (res.ok) {
        const data = await res.json();
        setCarts(data.carts || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Abandoned Carts</h2>
        <p className="text-muted-foreground mt-1">Customers who left items in their cart without checking out</p>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : carts.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No abandoned carts found</TableCell></TableRow>
            ) : (
              carts.map((cart) => {
                const total = cart.items.reduce((sum: number, i: any) => sum + (i.Product.price * i.quantity), 0);
                return (
                  <TableRow key={cart.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{cart.User?.name || 'Guest'}</span>
                        <span className="text-xs text-muted-foreground">{cart.User?.email || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{cart.items.length} items</span>
                    </TableCell>
                    <TableCell className="font-bold">{formatPrice(total, currency)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(cart.updatedAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={!cart.User?.email || sending === cart.id}
                            onClick={async () => {
                                setSending(cart.id);
                                try {
                                    const res = await adminFetch("/api/admin/abandoned-carts", {
                                        method: 'POST',
                                        body: JSON.stringify({ email: cart.User.email, userName: cart.User.name, cartId: cart.id })
                                    });
                                    if (res.ok) toast.success("Reminder sent!");
                                } finally { setSending(null); }
                            }}
                        >
                            {sending === cart.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Mail className="mr-2 h-3 w-3" />}
                            Remind
                        </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Star, CheckCircle2, XCircle, Trash2, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminFetch } from "@/lib/admin-fetch";
import { format } from "date-fns";

export function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const res = await adminFetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateStatus = async (id: string, isActive: boolean) => {
    try {
      const res = await adminFetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (res.ok) {
        toast.success(isActive ? "Review approved" : "Review hidden");
        fetchReviews();
      }
    } catch {
      toast.error("Failed to update review");
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await adminFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Review deleted");
        fetchReviews();
      }
    } catch {
      toast.error("Failed to delete review");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Product Reviews</h2>
        <p className="text-muted-foreground mt-1">Moderate customer ratings and comments</p>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">Loading...</TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No reviews found</TableCell>
              </TableRow>
            ) : (
              reviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.Product?.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{review.User?.name}</span>
                        <span className="text-xs text-muted-foreground">{review.User?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < review.rating ? "fill-current" : ""}`} />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-sm">{review.comment}</TableCell>
                  <TableCell>
                    <Badge variant={review.isActive ? "default" : "secondary"}>
                      {review.isActive ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        {review.isActive ? (
                            <Button variant="ghost" size="icon" onClick={() => updateStatus(review.id, false)} title="Hide">
                                <XCircle className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button variant="ghost" size="icon" className="text-emerald-600" onClick={() => updateStatus(review.id, true)} title="Approve">
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteReview(review.id)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

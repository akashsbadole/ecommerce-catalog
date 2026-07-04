"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, Search, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { adminFetch } from "@/lib/admin-fetch";

export function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "", description: "", image: "" });

  const fetchBrands = async () => {
    try {
      const res = await adminFetch("/api/brands");
      if (res.ok) {
        const data = await res.json();
        setBrands(data.brands || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await adminFetch("/api/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Brand created");
        setOpen(false);
        setFormData({ name: "", slug: "", description: "", image: "" });
        fetchBrands();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Brands</h2>
          <p className="text-muted-foreground mt-1">Manage product brands and manufacturers</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Brand
        </Button>
      </div>

      <div className="border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10">Loading...</TableCell></TableRow>
            ) : brands.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No brands found</TableCell></TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center overflow-hidden">
                        {brand.image ? <img src={brand.image} alt="" className="h-full w-full object-contain" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{brand.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{brand.slug}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Brand</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (Optional)</Label>
              <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="img">Logo URL</Label>
              <Input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Brand
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

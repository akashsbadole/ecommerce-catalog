'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  RefreshCw,
  DollarSign,
  Building2,
  Package,
  Percent,
  Loader2,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { adminFetch } from '@/lib/admin-fetch';

interface Company {
  id: string;
  name: string;
  tier: string;
  discountRate: number | null;
  isVerified: boolean;
}

interface CustomPrice {
  id: string;
  companyId: string;
  productId: string;
  price: number;
  createdAt: string;
  updatedAt: string;
  Company: { id: string; name: string };
  Product: { id: string; name: string; sku: string | null; price: number };
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const PAGE_SIZE = 20;

export function AdminPriceLists() {
  // Company discount state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesSearch, setCompaniesSearch] = useState('');
  const [discountPage, setDiscountPage] = useState(1);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [discountPages, setDiscountPages] = useState(0);

  // Custom prices state
  const [prices, setPrices] = useState<CustomPrice[]>([]);
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesSearch, setPricesSearch] = useState('');
  const [pricePage, setPricePage] = useState(1);
  const [priceTotal, setPriceTotal] = useState(0);
  const [pricePages, setPricePages] = useState(0);

  // Products for dropdown
  const [products, setProducts] = useState<Product[]>([]);

  // Editing discount inline
  const [editingDiscount, setEditingDiscount] = useState<{
    id: string;
    rate: string;
  } | null>(null);
  const [savingDiscount, setSavingDiscount] = useState(false);

  // Add custom price dialog
  const [addPriceOpen, setAddPriceOpen] = useState(false);
  const [addPriceForm, setAddPriceForm] = useState({
    companyId: '',
    productId: '',
    price: '',
  });
  const [savingPrice, setSavingPrice] = useState(false);

  // Product searchable dropdown
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Edit custom price inline
  const [editingPrice, setEditingPrice] = useState<{
    id: string;
    price: string;
  } | null>(null);

  // Delete custom price
  const [deletePriceId, setDeletePriceId] = useState<string | null>(null);
  const [deletingPrice, setDeletingPrice] = useState(false);

  // Bulk upload
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkData, setBulkData] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchCompanies = useCallback(async (page = 1, search = '') => {
    try {
      setCompaniesLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (search) params.set('search', search);
      const res = await adminFetch(`/api/companies?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
        setDiscountTotal(data.pagination?.total || 0);
        setDiscountPages(data.pagination?.totalPages || 0);
      }
    } catch {
      toast.error('Failed to load companies');
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  const fetchPrices = useCallback(async (page = 1) => {
    try {
      setPricesLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(PAGE_SIZE));
      if (pricesSearch) params.set('productId', pricesSearch);
      const res = await adminFetch(
        `/api/admin/price-lists?${params.toString()}`
      );
      if (res.ok) {
        const data = await res.json();
        setPrices(data.prices || []);
        setPriceTotal(data.pagination?.total || 0);
        setPricePages(data.pagination?.totalPages || 0);
      }
    } catch {
      toast.error('Failed to load custom prices');
    } finally {
      setPricesLoading(false);
    }
  }, [pricesSearch]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await adminFetch('/api/products?all=true&limit=500');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCompanies(1, '');
    fetchPrices(1);
    fetchProducts();
  }, [fetchCompanies, fetchPrices, fetchProducts]);

  // Inline discount rate save
  const handleSaveDiscountRate = async (companyId: string) => {
    if (!editingDiscount || editingDiscount.id !== companyId) return;
    setSavingDiscount(true);
    try {
      const rate = parseFloat(editingDiscount.rate);
      if (isNaN(rate) || rate < 0 || rate > 100) {
        toast.error('Discount rate must be between 0 and 100');
        setSavingDiscount(false);
        return;
      }
      const res = await adminFetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountRate: rate / 100 }),
      });
      if (res.ok) {
        toast.success('Discount rate updated');
        setEditingDiscount(null);
        fetchCompanies(discountPage, companiesSearch);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update discount rate');
      }
    } catch {
      toast.error('Failed to update discount rate');
    } finally {
      setSavingDiscount(false);
    }
  };

  const handleSetGlobalDiscount = async (companyId: string) => {
    try {
      const res = await adminFetch(`/api/companies/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setGlobalDiscount: true }),
      });
      if (res.ok) {
        toast.success('Global discount applied');
        fetchCompanies(discountPage, companiesSearch);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to set global discount');
      }
    } catch {
      toast.error('Failed to set global discount');
    }
  };

  const handleAddPrice = async () => {
    if (!addPriceForm.companyId) {
      toast.error('Please select a company');
      return;
    }
    if (!addPriceForm.productId) {
      toast.error('Please select a product');
      return;
    }
    const price = parseFloat(addPriceForm.price);
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setSavingPrice(true);
    try {
      const res = await adminFetch('/api/admin/price-lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: addPriceForm.companyId,
          productId: addPriceForm.productId,
          price,
        }),
      });
      if (res.ok) {
        toast.success('Custom price added');
        setAddPriceOpen(false);
        setAddPriceForm({ companyId: '', productId: '', price: '' });
        fetchPrices(pricePage);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add custom price');
      }
    } catch {
      toast.error('Failed to add custom price');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleUpdatePrice = async (priceId: string) => {
    if (!editingPrice || editingPrice.id !== priceId) return;
    const price = parseFloat(editingPrice.price);
    if (isNaN(price) || price < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    try {
      const res = await adminFetch(`/api/admin/price-lists/${priceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price }),
      });
      if (res.ok) {
        toast.success('Price updated');
        setEditingPrice(null);
        fetchPrices(pricePage);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update price');
      }
    } catch {
      toast.error('Failed to update price');
    }
  };

  const handleDeletePrice = async () => {
    if (!deletePriceId) return;
    setDeletingPrice(true);
    try {
      const res = await adminFetch(
        `/api/admin/price-lists/${deletePriceId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        toast.success('Custom price deleted');
        setPrices((prev) => prev.filter((p) => p.id !== deletePriceId));
        setDeletePriceId(null);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete custom price');
      }
    } catch {
      toast.error('Failed to delete custom price');
    } finally {
      setDeletingPrice(false);
    }
  };

  const handleBulkUpload = async () => {
    if (!bulkData.trim()) {
      toast.error('Please enter bulk data');
      return;
    }
    setBulkLoading(true);
    try {
      const lines = bulkData.trim().split('\n');
      const prices = lines.map((line) => {
        const [companyId, productId, price] = line.split(',');
        return {
          companyId: companyId.trim(),
          productId: productId.trim(),
          price: parseFloat(price.trim()),
        };
      });
      const res = await adminFetch('/api/admin/price-lists/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prices }),
      });
      if (res.ok) {
        toast.success('Bulk upload successful');
        setBulkOpen(false);
        setBulkData('');
        fetchPrices(1);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Bulk upload failed');
      }
    } catch {
      toast.error('Bulk upload failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const selectedProduct = products.find(
    (p) => p.id === addPriceForm.productId
  );

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return (
          <Badge className="bg-slate-900 text-slate-100">Platinum</Badge>
        );
      case 'gold':
        return <Badge className="bg-amber-500 text-white">Gold</Badge>;
      case 'silver':
        return <Badge className="bg-slate-400 text-white">Silver</Badge>;
      default:
        return <Badge variant="secondary">Standard</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Price Lists</h2>
          <p className="text-muted-foreground">
            Manage customer-specific pricing and discounts
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            fetchCompanies(discountPage, companiesSearch);
            fetchPrices(pricePage);
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="discounts" className="w-full">
        <TabsList>
          <TabsTrigger value="discounts">
            <Percent className="mr-2 h-4 w-4" />
            Company Discounts
          </TabsTrigger>
          <TabsTrigger value="prices">
            <DollarSign className="mr-2 h-4 w-4" />
            Custom SKU Prices
          </TabsTrigger>
        </TabsList>

        {/* Company Discounts Tab */}
        <TabsContent value="discounts" className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies..."
                value={companiesSearch}
                onChange={(e) => setCompaniesSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDiscountPage(1);
                fetchCompanies(1, companiesSearch);
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <Card>
            {companiesLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : companies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">
                  No companies found
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {companiesSearch
                    ? 'No companies match your search'
                    : 'Companies appear here when B2B partners register'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Tier</TableHead>
                      <TableHead>Discount Rate</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{company.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getTierBadge(company.tier)}</TableCell>
                        <TableCell>
                          {editingDiscount?.id === company.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={editingDiscount.rate}
                                onChange={(e) =>
                                  setEditingDiscount({
                                    id: company.id,
                                    rate: e.target.value,
                                  })
                                }
                                className="h-8 w-20"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleSaveDiscountRate(company.id)
                                }
                                disabled={savingDiscount}
                              >
                                {savingDiscount ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:bg-muted px-2 py-1 rounded text-sm"
                              onClick={() =>
                                setEditingDiscount({
                                  id: company.id,
                                  rate:
                                    company.discountRate !== null
                                      ? String(company.discountRate * 100)
                                      : '0',
                                })
                              }
                            >
                              {company.discountRate !== null
                                ? `${(company.discountRate * 100).toFixed(1)}%`
                                : '0%'}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetGlobalDiscount(company.id)}
                          >
                            Set Global Discount
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

          {discountPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{' '}
                {(discountPage - 1) * PAGE_SIZE + 1} to{' '}
                {Math.min(discountPage * PAGE_SIZE, discountTotal)} of{' '}
                {discountTotal} companies
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDiscountPage((p) => p - 1);
                    fetchCompanies(discountPage - 1, companiesSearch);
                  }}
                  disabled={discountPage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {discountPage} of {discountPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDiscountPage((p) => p + 1);
                    fetchCompanies(discountPage + 1, companiesSearch);
                  }}
                  disabled={discountPage >= discountPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Custom SKU Prices Tab */}
        <TabsContent value="prices" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product..."
                  value={pricesSearch}
                  onChange={(e) => setPricesSearch(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchPrices(1)}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setBulkOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
              <Button size="sm" onClick={() => setAddPriceOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Price
              </Button>
            </div>
          </div>

          <Card>
            {pricesLoading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : prices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">
                  No custom prices found
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Set custom prices for specific company-product combinations
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Custom Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prices.map((cp) => (
                      <TableRow key={cp.id}>
                        <TableCell>
                          <span className="font-medium">
                            {cp.Company?.name}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">{cp.Product?.name}</span>
                            {cp.Product?.sku && (
                              <span className="text-xs text-muted-foreground font-mono">
                                SKU: {cp.Product.sku}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingPrice?.id === cp.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={editingPrice.price}
                                onChange={(e) =>
                                  setEditingPrice({
                                    id: cp.id,
                                    price: e.target.value,
                                  })
                                }
                                className="h-8 w-24"
                              />
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUpdatePrice(cp.id)}
                              >
                                <Check className="h-3 w-3 text-emerald-600" />
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:bg-muted px-2 py-1 rounded text-sm font-medium"
                              onClick={() =>
                                setEditingPrice({
                                  id: cp.id,
                                  price: String(cp.price),
                                })
                              }
                            >
                              ${cp.price.toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => setDeletePriceId(cp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>

          {pricePages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(pricePage - 1) * PAGE_SIZE + 1} to{' '}
                {Math.min(pricePage * PAGE_SIZE, priceTotal)} of{' '}
                {priceTotal} prices
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPricePage((p) => p - 1);
                    fetchPrices(pricePage - 1);
                  }}
                  disabled={pricePage <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Page {pricePage} of {pricePages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPricePage((p) => p + 1);
                    fetchPrices(pricePage + 1);
                  }}
                  disabled={pricePage >= pricePages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Custom Price Dialog */}
      <Dialog open={addPriceOpen} onOpenChange={setAddPriceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Price</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cp-company">
                Company <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={addPriceForm.companyId}
                onValueChange={(val) =>
                  setAddPriceForm((prev) => ({ ...prev, companyId: val }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-product">
                Product <span className="text-rose-500">*</span>
              </Label>
              <Popover
                open={productSearchOpen}
                onOpenChange={setProductSearchOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={productSearchOpen}
                    className="w-full justify-between"
                  >
                    {selectedProduct
                      ? selectedProduct.name
                      : 'Select a product...'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search products..."
                      value={productSearch}
                      onValueChange={setProductSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No products found.</CommandEmpty>
                      <CommandGroup>
                        {products
                          .filter(
                            (p) =>
                              !productSearch ||
                              p.name
                                .toLowerCase()
                                .includes(productSearch.toLowerCase()) ||
                              (p.sku &&
                                p.sku
                                  .toLowerCase()
                                  .includes(productSearch.toLowerCase()))
                          )
                          .slice(0, 50)
                          .map((product) => (
                            <CommandItem
                              key={product.id}
                              value={product.id}
                              onSelect={(currentValue) => {
                                setAddPriceForm((prev) => ({
                                  ...prev,
                                  productId: currentValue,
                                }));
                                setProductSearchOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  addPriceForm.productId === product.id
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{product.name}</span>
                                {product.sku && (
                                  <span className="text-xs text-muted-foreground">
                                    SKU: {product.sku}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-price">
                Price <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="cp-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={addPriceForm.price}
                onChange={(e) =>
                  setAddPriceForm((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddPriceOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddPrice} disabled={savingPrice}>
              {savingPrice && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Add Price
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Upload Custom Prices</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Data (one per line: companyId,productId,price)</Label>
              <textarea
                className="w-full min-h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-mono"
                placeholder={`comp1,prod1,19.99\ncomp1,prod2,29.99\ncomp2,prod1,14.99`}
                value={bulkData}
                onChange={(e) => setBulkData(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Format: companyId,productId,price (one per line)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpload} disabled={bulkLoading}>
              {bulkLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Price Confirmation */}
      <AlertDialog
        open={!!deletePriceId}
        onOpenChange={() => setDeletePriceId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Price</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this custom price? The product
              will revert to its default pricing for this company.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrice}
              disabled={deletingPrice}
              className="bg-rose-600 hover:bg-rose-700"
            >
              {deletingPrice ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

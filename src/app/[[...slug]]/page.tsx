"use client";

import { useEffect, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { usePathname, useParams } from "next/navigation";
import { StoreLayout } from "@/components/store/StoreLayout";
import { HomePage } from "@/components/store/HomePage";
import { CataloguePage } from "@/components/store/CataloguePage";
import { CategoryPage } from "@/components/store/CategoryPage";
import { CmsPage } from "@/components/store/CmsPage";
import { ContentPageView } from "@/components/store/ContentPageView";
import { BlogPage } from "@/components/store/BlogPage";
import { BlogPostView } from "@/components/store/BlogPostView";
import { CartPage } from "@/components/store/CartPage";
import { WishlistPage } from "@/components/store/WishlistPage";
import { OrdersPage } from "@/components/store/OrdersPage";
import { OrderDetailPage } from "@/components/store/OrderDetailPage";
import { AccountPage } from "@/components/store/AccountPage";
import { CheckoutPage } from "@/components/store/CheckoutPage";
import { QuickOrderPage } from "@/components/store/QuickOrderPage";
import { InvoicesPage } from "@/components/store/InvoicesPage";
import { InvoiceDetailPage } from "@/components/store/InvoiceDetailPage";
import { SubscriptionsPage } from "@/components/store/SubscriptionsPage";
import { ComparePage } from "@/components/store/ComparePage";
import { AboutPage } from "@/components/store/AboutPage";
import { ManufacturingPage } from "@/components/store/ManufacturingPage";
import { ContactPage } from "@/components/store/ContactPage";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import BuyerPortalPage from "@/app/portal/page";

const CMS_PAGES = ["catalogue"];

export default function CatchAllPage() {
  const currentPage = useAppStore((s) => s.currentPage);
  const navigate = useAppStore((s) => s.navigate);
  const auth = useAppStore((s) => s.auth);
  const fetchCart = useAppStore((s) => s.fetchCart);
  const fetchWishlist = useAppStore((s) => s.fetchWishlist);

  const pathname = usePathname();
  const params = useParams();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  const fullPath = useMemo(() => {
    const slugParam = params.slug;
    const slugPath = (Array.isArray(slugParam) ? slugParam : slugParam ? [slugParam] : []).join("/") || "";
    return slugPath ? `/${slugPath}` : "/";
  }, [params.slug]);

  useEffect(() => {
    const routeFromPath = (path: string) => {
      if (path === "/" || path === "") return;
      const segments = path.split("/").filter(Boolean);
      if (segments[0] === "catalogue") {
        if (segments[1]) navigate("category", segments[1]);
        else navigate("catalogue");
      } else if (segments[0] === "product") {
        if (segments[1]) {
          fetch(`/api/products/${segments[1]}`)
            .then((r) => r.ok ? r.json() : null)
            .then((product) => {
              const catSlug = product?.category?.slug || product?.Category?.slug;
              navigate(catSlug ? "category" : "catalogue", catSlug || undefined);
            })
            .catch(() => navigate("catalogue"));
        }
      } else if (segments[0] === "about") {
        navigate("about");
      } else if (segments[0] === "manufacturing") {
        navigate("manufacturing");
      } else if (segments[0] === "products") {
        navigate("products");
      } else if (segments[0] === "contact") {
        navigate("contact");
      } else if (segments[0] === "blog") {
        if (segments[1]) navigate("blog-post", segments[1]);
        else navigate("blog");
      } else if (segments[0] === "portal") {
        navigate("portal");
      } else if (segments[0] === "compare") {
        navigate("compare");
      } else if (segments[0] === "cart") {
        navigate("cart");
      } else if (segments[0] === "wishlist") {
        navigate("wishlist");
      } else if (segments[0] === "orders") {
        if (segments[1]) navigate("order-detail", segments[1]);
        else navigate("orders");
      } else if (segments[0] === "account") {
        navigate("account");
      } else if (segments[0] === "checkout") {
        navigate("checkout");
      } else if (segments[0] === "quick-order") {
        navigate("quick-order");
      } else if (segments[0] === "invoices") {
        if (segments[1]) navigate("invoice-detail", segments[1]);
        else navigate("invoices");
      } else if (segments[0] === "subscriptions") {
        navigate("subscriptions");
      } else if (CMS_PAGES.includes(segments[0])) {
        navigate("content-page", segments[0]);
      } else {
        navigate("content-page", segments.join("/"));
      }
    };

    if (!isAdminRoute && fullPath !== "/") {
      routeFromPath(fullPath);
    }

    const handlePopState = () => {
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath === "") {
        navigate("home");
      } else if (!currentPath.startsWith("/admin")) {
        routeFromPath(currentPath);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [fullPath, navigate]);

  useEffect(() => {
    if (auth.token) {
      fetchCart();
      fetchWishlist();
    }
  }, [auth.token, fetchCart, fetchWishlist]);

  const renderPage = () => {
    switch (currentPage.type) {
      case "home":
        return <HomePage onNavigate={navigate} />;
      case "catalogue":
        return <CataloguePage onNavigate={navigate} />;
      case "category":
        return <CategoryPage slug={currentPage.slug} onNavigate={navigate} />;
      case "content-page":
        return <CmsPage slug={currentPage.slug} onNavigate={navigate} />;
      case "about":
        return <AboutPage onNavigate={navigate} />;
      case "manufacturing":
        return <ManufacturingPage onNavigate={navigate} />;
      case "contact":
        return <ContactPage onNavigate={navigate} />;
      case "blog":
        return <BlogPage onNavigate={navigate} />;
      case "blog-post":
        return <BlogPostView postId={currentPage.postId} onNavigate={navigate} />;
      case "portal":
        return <BuyerPortalPage />;
      case "cart":
        return <CartPage onNavigate={navigate} />;
      case "wishlist":
        return <WishlistPage onNavigate={navigate} />;
      case "orders":
        return <OrdersPage onNavigate={navigate} />;
      case "order-detail":
        return (
          <OrderDetailPage orderId={currentPage.orderId} onNavigate={navigate} />
        );
      case "account":
        return <AccountPage onNavigate={navigate} />;
      case "checkout":
        return <CheckoutPage onNavigate={navigate} />;
      case "compare":
        return <ComparePage onNavigate={navigate} />;
      case "quick-order":
        return <QuickOrderPage onNavigate={navigate} />;
      case "invoices":
        return <InvoicesPage onNavigate={navigate} />;
      case "invoice-detail":
        return <InvoiceDetailPage invoiceId={currentPage.invoiceId} onNavigate={navigate} />;
      case "subscriptions":
        return <SubscriptionsPage onNavigate={navigate} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="relative">
              <span className="text-[8rem] font-black leading-none tracking-tighter text-emerald-100 dark:text-emerald-900/30 select-none sm:text-[10rem]">
                404
              </span>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">
              Page not found
            </h1>
            <p className="mt-2 text-muted-foreground max-w-md">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate("home")}
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                Back to Home
              </button>
              <button
                onClick={() => navigate("catalogue")}
                className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Browse Catalogue
              </button>
            </div>
          </div>
        );
    }
  };

  if (isAdminRoute) {
    return null;
  }

  return (
    <StoreLayout currentPage={currentPage.type} onNavigate={navigate}>
      <ErrorBoundary>{renderPage()}</ErrorBoundary>
    </StoreLayout>
  );
}

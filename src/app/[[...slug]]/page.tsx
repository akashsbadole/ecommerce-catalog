"use client";

import { useEffect, useMemo } from "react";
import { useAppStore } from "@/lib/store";
import { usePathname, useParams } from "next/navigation";
import { StoreLayout } from "@/components/store/StoreLayout";
import { HomePage } from "@/components/store/HomePage";
import { CataloguePage } from "@/components/store/CataloguePage";
import { CategoryPage } from "@/components/store/CategoryPage";
import { ProductPage } from "@/components/store/ProductPage";
import { ProductsOverviewPage } from "@/components/store/ProductsOverviewPage";
import { BlogPage } from "@/components/store/BlogPage";
import { BlogPostView } from "@/components/store/BlogPostView";
import { CmsPage } from "@/components/store/CmsPage";

import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function CatchAllPage() {
  const currentPage = useAppStore((s) => s.currentPage);
  const navigate = useAppStore((s) => s.navigate);

  const pathname = usePathname();
  const params = useParams();
  const isAdminRoute = pathname === "/admin" || pathname.startsWith("/admin/");

  const fullPath = useMemo(() => {
    const slugParam = params.slug;
    const slugPath =
      (Array.isArray(slugParam)
        ? slugParam
        : slugParam
          ? [slugParam]
          : []
      ).join("/") || "";
    return slugPath ? `/${slugPath}` : "/";
  }, [params.slug]);

  useEffect(() => {
    const routeFromPath = (path: string) => {
      if (path === "/" || path === "") return;
      const segments = path.split("/").filter(Boolean);
      if (segments[0] === "product" && segments[1]) {
        navigate("category", segments[1]);
      } else if (segments[0] === "catalogue") {
        if (segments[1]) navigate("category", segments[1]);
        else navigate("catalogue");
      } else if (segments[0] === "about") {
        navigate("content-page", "about-us");
      } else if (segments[0] === "manufacturing") {
        navigate("content-page", "manufacturing");
      } else if (segments[0] === "contact") {
        navigate("content-page", "contact");
      } else if (segments[0] === "blog") {
        if (segments[1]) navigate("blog-post", segments[1]);
        else navigate("blog");
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
      case "product-page":
        return <ProductPage slug={currentPage.slug} onNavigate={navigate} />;
      case "products":
        return <ProductsOverviewPage onNavigate={navigate} />;
      case "blog":
        return <BlogPage onNavigate={navigate} />;
      case "blog-post":
        return <BlogPostView postId={currentPage.slug} onNavigate={navigate} />;
      case "about":
        return <CmsPage slug="about-us" onNavigate={navigate} />;
      case "manufacturing":
        return <CmsPage slug="manufacturing" onNavigate={navigate} />;
      case "contact":
        return <CmsPage slug="contact" onNavigate={navigate} />;

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

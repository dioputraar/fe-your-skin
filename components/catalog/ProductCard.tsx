"use client";

import Link from "next/link";
import { Package } from "lucide-react";

interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const getProductImage = (): string | null => {
    if (product.images && product.images.length > 0) {
      const first = product.images[0];
      const path = typeof first === "string" ? first : first.image_url;
      if (path) {
        return path.startsWith("http") || path.startsWith("/")
          ? path
          : `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/${path}`;
      }
    }
    return null;
  };

  const imageUrl = getProductImage();
  const brandName = product.brand?.name || "YourSkin";
  const categoryName = product.category?.name || "Skincare";

  return (
    <Link
      href={`/catalog/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[#e8f1f5] bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#cfe4ee] hover:shadow-lg"
    >
      {/* Product Image Box */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-b from-[#f9fcfd] to-[#edf6f9] p-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.product_name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-skin-muted/40">
            <Package size={44} strokeWidth={1.5} />
            <span className="mt-2 text-xs font-medium">No image</span>
          </div>
        )}
      </div>

      {/* Product Info (Minimalist) */}
      <div className="flex flex-1 flex-col pt-3.5">
        <span className="text-[11px] font-bold uppercase tracking-wider text-skin-muted">
          {brandName}
        </span>
        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-skin-ink transition-colors group-hover:text-skin-blue">
          {product.product_name}
        </h3>
        <div className="mt-auto pt-3">
          <span className="inline-block rounded-full bg-skin-sky px-2.5 py-0.5 text-[11px] font-semibold text-skin-eyebrow">
            {categoryName}
          </span>
        </div>
      </div>
    </Link>
  );
}


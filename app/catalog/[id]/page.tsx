"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Cookies from "js-cookie";
import { Button, Chip } from "@heroui/react";
import {
  ArrowLeft,
  Package,
  ShieldCheck,
  Zap,
  Sparkles,
  FlaskConical,
  XCircle,
  Tag,
  CheckCircle2,
  AlertCircle,
  Droplets,
  Layers,
  HeartHandshake,
  Check,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [product, setProduct] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedImageIndex(0);

      try {
        const token = Cookies.get("token");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/product/${productId}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        const data = res.data?.data || res.data;
        setProduct(data);
      } catch (err: any) {
        console.error("Gagal mengambil detail produk:", err);
        setError(
          err.response?.data?.message ||
            "Produk tidak ditemukan atau gagal memuat data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Image URL Resolver
  const getImageUrl = (img: any): string => {
    if (!img) return "/file.svg";
    const path = typeof img === "string" ? img : img.image_url || img.url || "";
    if (!path) return "/file.svg";
    return path.startsWith("http") || path.startsWith("/")
      ? path
      : `${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/${path}`;
  };

  const images: any[] = product?.images || [];
  const ingredients: any[] =
    product?.product_ingredients || product?.ingredients || [];

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fcfd]">
      <Navbar />

      <main className="flex-1 pb-16 pt-6">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          {/* Breadcrumb & Back Action */}
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-full border border-[#d9e8ef] bg-white px-4 py-2 text-xs font-semibold text-skin-ink shadow-sm transition-all hover:border-skin-blue hover:text-skin-blue"
            >
              <ArrowLeft size={14} />
              Kembali ke Katalog
            </Link>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="grid gap-10 md:grid-cols-2">
              <div className="aspect-square w-full animate-pulse rounded-3xl bg-white p-6 shadow-sm" />
              <div className="space-y-4">
                <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-20 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-40 w-full animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ) : error || !product ? (
            /* Error / Not Found State */
            <div className="my-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#cfe1e8] bg-white p-12 text-center shadow-sm">
              <div className="grid size-16 place-items-center rounded-3xl bg-skin-pink-tile text-skin-pink">
                <AlertCircle size={32} />
              </div>
              <h2 className="mt-4 text-xl font-bold text-skin-ink">
                Produk Tidak Ditemukan
              </h2>
              <p className="mt-2 text-sm text-skin-muted">{error}</p>
              <Button
                onPress={() => router.push("/catalog")}
                className="mt-6 rounded-2xl bg-skin-blue font-bold text-white shadow"
              >
                Lihat Semua Produk
              </Button>
            </div>
          ) : (
            /* Product Detail Showcase */
            <div className="space-y-12">
              <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
                {/* Left Column: Image Gallery (5 cols) */}
                <div className="space-y-4 lg:col-span-5">
                  <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-[#e5eff3] bg-white p-6 shadow-sm">
                    {images.length > 0 ? (
                      <img
                        src={getImageUrl(images[selectedImageIndex])}
                        alt={product.product_name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-skin-muted/40">
                        <Package size={64} strokeWidth={1.5} />
                        <span className="mt-2 text-sm font-medium">
                          Foto belum tersedia
                        </span>
                      </div>
                    )}

                    {product.brand?.is_halal_certified && (
                      <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 ring-1 ring-emerald-200">
                        <ShieldCheck size={12} /> Halal Certified
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {images.length > 1 && (
                    <div className="flex gap-2.5 overflow-x-auto pb-2">
                      {images.map((img, idx) => {
                        const isSelected = idx === selectedImageIndex;
                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedImageIndex(idx)}
                            className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-1.5 transition-all ${
                              isSelected
                                ? "border-skin-blue shadow-md scale-105"
                                : "border-[#e5eff3] opacity-70 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={getImageUrl(img)}
                              alt={`Thumbnail ${idx + 1}`}
                              className="h-full w-full object-contain"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Column: Key Details & Specs (7 cols) */}
                <div className="flex flex-col justify-between lg:col-span-7">
                  <div>
                    {/* Brand & Category */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-skin-eyebrow">
                        {product.brand?.name || "YourSkin"}
                      </span>
                      {product.category?.name && (
                        <span className="rounded-full bg-skin-sky px-3 py-0.5 text-xs font-semibold text-skin-blue">
                          {product.category.name}
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          product.stock_status !== false
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {product.stock_status !== false
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>

                    {/* Product Name */}
                    <h1 className="mt-3 text-2xl font-extrabold text-skin-ink md:text-3xl">
                      {product.product_name}
                    </h1>

                    {/* Quick Specs Grid */}
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {/* Format */}
                      <div className="rounded-2xl border border-[#e6eff2] bg-white p-3.5 shadow-xs">
                        <span className="text-[11px] font-medium text-skin-muted">
                          Format
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-skin-ink">
                          {product.format || "-"}
                        </p>
                      </div>

                      {/* Scope */}
                      <div className="rounded-2xl border border-[#e6eff2] bg-white p-3.5 shadow-xs">
                        <span className="text-[11px] font-medium text-skin-muted">
                          Area Pemakaian
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-skin-ink">
                          {product.scope || "-"}
                        </p>
                      </div>

                      {/* Volume */}
                      <div className="rounded-2xl border border-[#e6eff2] bg-white p-3.5 shadow-xs">
                        <span className="text-[11px] font-medium text-skin-muted">
                          Ukuran
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-skin-ink">
                          {product.volume_amount
                            ? `${product.volume_amount} ${product.volume_unit || "ml"}`
                            : "-"}
                        </p>
                      </div>

                      {/* pH Level */}
                      <div className="rounded-2xl border border-[#e6eff2] bg-white p-3.5 shadow-xs">
                        <span className="text-[11px] font-medium text-skin-muted">
                          pH Formula
                        </span>
                        <p className="mt-0.5 text-sm font-bold text-skin-ink">
                          {product.ph_level ? `pH ${product.ph_level}` : "Optimal"}
                        </p>
                      </div>
                    </div>

                    {/* Formulation Highlights / Free-from */}
                    <div className="mt-6 flex flex-wrap gap-2">
                      {product.is_fragrance_free && (
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          <Check size={13} />
                          Fragrance Free
                        </div>
                      )}
                      {product.is_alcohol_free && (
                        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                          <Check size={13} />
                          Alcohol Free
                        </div>
                      )}
                      {product.brand?.parent_company && (
                        <div className="flex items-center gap-1.5 rounded-full bg-[#f3f7fa] px-3 py-1 text-xs font-medium text-skin-muted">
                          Manufaktur: {product.brand.parent_company}
                        </div>
                      )}
                    </div>

                    {/* Target Concerns */}
                    {product.target_concerns &&
                      product.target_concerns.length > 0 && (
                        <div className="mt-6 border-t border-[#e6eff2] pt-5">
                          <span className="text-xs font-bold uppercase tracking-wider text-skin-muted">
                            Target Perhatian Kulit
                          </span>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            {product.target_concerns.map(
                              (concern: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-skin-sky px-3 py-1 text-xs font-medium text-skin-blue shadow-xs"
                                >
                                  <Sparkles size={12} />
                                  {concern}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Product Ingredients Showcase Section */}
              <div className="rounded-3xl border border-[#e6eff2] bg-white p-6 shadow-sm md:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#eef3f6] pb-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-2xl bg-skin-blue-tile text-skin-ink">
                      <FlaskConical size={20} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-skin-ink">
                        Komposisi & Bahan Aktif
                      </h2>
                      <p className="text-xs text-skin-muted">
                        Daftar bahan yang terdaftar dalam formula produk ini
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-skin-muted">
                    {ingredients.length} bahan tertera
                  </span>
                </div>

                {ingredients.length === 0 ? (
                  <p className="py-6 text-center text-sm text-skin-muted">
                    Data bahan aktif belum dimasukkan untuk produk ini.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {ingredients.map((item: any, idx: number) => {
                      const ingName =
                        item.ingredient?.name || item.name || "Ingredient";
                      const isKey = Boolean(item.is_key_active);
                      const percentage = item.concentration_percentage;
                      const primaryFunction =
                        item.ingredient?.primary_function ||
                        item.primary_function;
                      const isSafePregnancy =
                        item.ingredient?.is_safe_for_pregnancy ??
                        item.is_safe_for_pregnancy;
                      const isSafeFungal =
                        item.ingredient?.is_safe_for_fungal_acne ??
                        item.is_safe_for_fungal_acne;

                      return (
                        <div
                          key={idx}
                          className={`flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                            isKey
                              ? "border-skin-blue/30 bg-gradient-to-b from-[#f0f8fb] to-white shadow-xs"
                              : "border-[#e9f0f4] bg-[#fafcfd]"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-sm font-bold text-skin-ink">
                                {ingName}
                              </h3>
                              {isKey && (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-skin-blue px-2 py-0.5 text-[10px] font-bold text-white">
                                  <Zap size={10} /> Key Active
                                </span>
                              )}
                            </div>

                            {primaryFunction && (
                              <p className="mt-1 text-xs text-skin-muted">
                                {primaryFunction}
                              </p>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#edf3f6] pt-2.5 text-[11px]">
                            {percentage != null && percentage > 0 ? (
                              <span className="font-semibold text-skin-blue">
                                {percentage}% Konsentrasi
                              </span>
                            ) : (
                              <span className="text-skin-muted">-</span>
                            )}

                            <div className="flex items-center gap-2">
                              {isSafePregnancy && (
                                <span
                                  title="Safe for pregnancy"
                                  className="text-[10px] font-medium text-emerald-600"
                                >
                                  ✓ Bumil Safe
                                </span>
                              )}
                              {isSafeFungal && (
                                <span
                                  title="Safe for fungal acne"
                                  className="text-[10px] font-medium text-emerald-600"
                                >
                                  ✓ Acne Safe
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}


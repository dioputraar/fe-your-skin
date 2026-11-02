"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  Button,
  Chip,
  Modal,
} from "@heroui/react";
import {
  X,
  Package,
  ShieldCheck,
  Zap,
  Sparkles,
  FlaskConical,
  XCircle,
  Tag,
} from "lucide-react";

interface DetailModalProps {
  productId?: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function DetailModal({
  productId,
  isOpen,
  onOpenChange,
}: DetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (!isOpen || !productId) {
      setProduct(null);
      setError(null);
      return;
    }

    const fetchProductDetail = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedImageIndex(0);

      try {
        const res = await api.get(`/product/${productId}`);
        const data = res.data?.data || res.data;
        setProduct(data);
      } catch (err: any) {
        console.error("Gagal mengambil detail produk:", err);
        setError(err.response?.data?.message || "Gagal memuat data produk.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetail();
  }, [isOpen, productId]);

  const handleClose = () => {
    onOpenChange(false);
    setProduct(null);
    setError(null);
  };

  // Helper resolusi URL gambar
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
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => (open ? onOpenChange(true) : handleClose())}
    >
      <Modal.Container placement="center">
        <Modal.Dialog className="sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl">
          <Modal.CloseTrigger />
          <Modal.Header className="flex items-center gap-3 border-b border-[#E7EEF2] pb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-skin-sky text-skin-blue">
              <Sparkles size={18} />
            </div>
            <div>
              <Modal.Heading>
                <span className="text-xs font-bold uppercase tracking-widest text-skin-blue">
                  Product Details
                </span>
                <h2 className="text-lg font-bold text-[#17324A]">
                  {product?.product_name || "Detail Produk"}
                </h2>
              </Modal.Heading>
            </div>
          </Modal.Header>

          <Modal.Body className="py-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-10 h-10 border-4 border-skin-blue border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-skin-muted">
                  Memuat detail produk...
                </span>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <XCircle size={24} />
                </div>
                <p className="text-sm font-semibold text-gray-800">{error}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  onPress={() => {
                    if (productId) {
                      setIsLoading(true);
                      setError(null);
                    }
                  }}
                  className="rounded-xl mt-2"
                >
                  Coba Lagi
                </Button>
              </div>
            ) : product ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Kolom Kiri: Galeri Gambar */}
                <div className="md:col-span-5 flex flex-col gap-3">
                  <div className="relative aspect-square w-full rounded-2xl border border-[#d9e6ec] bg-[#F8FAFC] overflow-hidden flex items-center justify-center p-3 shadow-xs">
                    {images.length > 0 ? (
                      <img
                        src={getImageUrl(images[selectedImageIndex] || images[0])}
                        alt={product.product_name}
                        className="h-full w-full object-contain transition-all duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                        <Package size={40} className="stroke-[1.5]" />
                        <span className="text-xs">Tidak ada gambar</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail List */}
                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative h-16 w-16 shrink-0 rounded-xl border-2 overflow-hidden bg-white p-1 transition cursor-pointer ${
                            selectedImageIndex === idx
                              ? "border-skin-blue ring-2 ring-skin-blue/20"
                              : "border-[#d9e6ec] hover:border-skin-blue/50"
                          }`}
                        >
                          <img
                            src={getImageUrl(img)}
                            alt={`Thumbnail ${idx + 1}`}
                            className="h-full w-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Status Pills */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center gap-2 rounded-xl border border-[#d9e6ec] bg-white p-2.5">
                      <Zap
                        size={16}
                        className={product.is_active ? "text-emerald-500" : "text-gray-400"}
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-medium">
                          Status
                        </span>
                        <span className="text-xs font-semibold text-[#17324A]">
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 rounded-xl border border-[#d9e6ec] bg-white p-2.5">
                      <Package
                        size={16}
                        className={product.stock_status ? "text-skin-blue" : "text-amber-500"}
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 uppercase font-medium">
                          Stock
                        </span>
                        <span className="text-xs font-semibold text-[#17324A]">
                          {product.stock_status ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Detail Informasi & Spesifikasi */}
                <div className="md:col-span-7 flex flex-col gap-5">
                  {/* Brand & Category Header */}
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {product.brand && (
                        <Chip
                          size="sm"
                          variant="secondary"
                          className="bg-skin-sky text-skin-blue font-semibold text-xs gap-1.5"
                        >
                          {product.brand.image && (
                            <img
                              src={getImageUrl(product.brand.image)}
                              alt={product.brand.name}
                              className="w-3.5 h-3.5 rounded-full object-cover inline-block"
                            />
                          )}
                          {product.brand.name}
                        </Chip>
                      )}

                      {product.category && (
                        <Chip
                          size="sm"
                          variant="secondary"
                          className="bg-purple-50 text-purple-700 font-semibold text-xs gap-1.5"
                        >
                          {product.category.icon && (
                            <img
                              src={getImageUrl(product.category.icon)}
                              alt={product.category.name}
                              className="w-3.5 h-3.5 object-contain inline-block"
                            />
                          )}
                          {product.category.name}
                        </Chip>
                      )}
                    </div>

                    <h1 className="text-2xl font-extrabold text-[#17324A] leading-tight">
                      {product.product_name}
                    </h1>
                  </div>

                  {/* Specification Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-2xl border border-[#d9e6ec] bg-[#FBFDFE] p-3.5">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Scope
                      </span>
                      <p className="text-sm font-bold text-[#17324A] mt-0.5">
                        {product.scope || "-"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Format
                      </span>
                      <p className="text-sm font-bold text-[#17324A] mt-0.5">
                        {product.format || "-"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        Volume
                      </span>
                      <p className="text-sm font-bold text-[#17324A] mt-0.5">
                        {product.volume_amount ? `${product.volume_amount} ${product.volume_unit || "ml"}` : "-"}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400">
                        pH Level
                      </span>
                      <p className="text-sm font-bold text-[#17324A] mt-0.5">
                        {product.ph_level !== undefined && product.ph_level !== null ? product.ph_level : "-"}
                      </p>
                    </div>
                  </div>

                  {/* Formula Attributes / Safety Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                        product.is_fragnant_free || product.is_fragrance_free
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                    >
                      <ShieldCheck size={14} />
                      {product.is_fragnant_free || product.is_fragrance_free
                        ? "Fragrance Free"
                        : "Contains Fragrance"}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                        product.is_alcohol_free
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                    >
                      <ShieldCheck size={14} />
                      {product.is_alcohol_free ? "Alcohol Free" : "Contains Alcohol"}
                    </span>
                  </div>

                  {/* Target Concerns (jika ada) */}
                  {product.target_concerns && product.target_concerns.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <Tag size={13} /> Target Concerns
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {product.target_concerns.map((concern: string, idx: number) => (
                          <Chip
                            key={idx}
                            size="sm"
                            variant="secondary"
                            className="bg-amber-50 text-amber-800 text-xs font-medium"
                          >
                            {concern}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ingredients Section */}
                  <div className="flex flex-col gap-2 pt-1 border-t border-[#E7EEF2]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                        <FlaskConical size={14} className="text-skin-blue" />
                        Formula Ingredients ({ingredients.length})
                      </span>
                    </div>

                    {ingredients.length > 0 ? (
                      <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                        {ingredients.map((item: any, idx: number) => {
                          const name =
                            item.ingredient?.name ||
                            item.name ||
                            item.ingredient_name ||
                            `Ingredient #${item.ingredient_id || idx + 1}`;
                          const percentage = Number(item.concentration_percentage ?? 0);
                          const isKeyActive = Boolean(item.is_key_active);

                          return (
                            <div
                              key={item.id || item.ingredient_id || idx}
                              className="flex items-center justify-between p-2.5 rounded-xl border border-[#d9e6ec] bg-white text-xs hover:border-skin-blue/40 transition"
                            >
                              <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-skin-sky text-skin-blue text-[10px] font-bold">
                                  {item.order_in_formula || idx + 1}
                                </span>
                                <span className="font-semibold text-[#17324A]">
                                  {name}
                                </span>
                                {isKeyActive && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                                    Key Active
                                  </span>
                                )}
                              </div>

                              <Chip
                                size="sm"
                                variant="secondary"
                                className="bg-skin-sky text-skin-blue font-semibold text-[11px] px-2"
                              >
                                {percentage > 0 ? `${percentage}%` : "0%"}
                              </Chip>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic py-1">
                        Belum ada ingredient yang terdaftar untuk produk ini.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </Modal.Body>

          <Modal.Footer className="border-t border-[#E7EEF2] pt-4">
            <Button
              type="button"
              variant="secondary"
              onPress={handleClose}
              className="rounded-xl px-5 transition active:scale-[0.97]"
            >
              <X size={16} /> Close
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}

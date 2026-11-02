"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import api from "@/lib/api";
import { Button } from "@heroui/react";
import {
  Search,
  Filter,
  X,
  RotateCcw,
  PackageOpen,
  Loader2,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/catalog/ProductCard";

const ITEMS_PER_PAGE = 12;

export default function CatalogPage() {
  // Data state
  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [brands, setBrands] = useState<IBrand[]>([]);

  // Filter state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  // Collapsible sections
  const [categoryExpanded, setCategoryExpanded] = useState(true);
  const [brandExpanded, setBrandExpanded] = useState(true);

  // Pagination & infinite scroll
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Mobile drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sentinel ref for infinite scroll
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // 1. Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // 2. Fetch Master Categories & Brands for Sidebar
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, brandRes] = await Promise.allSettled([
          api.get("/category"),
          api.get("/brand"),
        ]);

        if (catRes.status === "fulfilled") {
          const catData = catRes.value.data?.data || catRes.value.data || [];
          setCategories(Array.isArray(catData) ? catData : []);
        }

        if (brandRes.status === "fulfilled") {
          const brandData = brandRes.value.data?.data || brandRes.value.data || [];
          setBrands(Array.isArray(brandData) ? brandData : []);
        }
      } catch (err) {
        console.error("Gagal mengambil master filter:", err);
      }
    };

    fetchMetadata();
  }, []);

  // 3. Fetch Products (Reset on filter change)
  const fetchProducts = useCallback(
    async (targetPage: number, isInitial = false) => {
      if (isInitial) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        // Kirim filter parameter jika ada
        const params: Record<string, any> = {
          page: targetPage,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch || undefined,
        };

        if (selectedCategories.length === 1) {
          params.category_id = selectedCategories[0];
        }
        if (selectedBrands.length === 1) {
          params.brand_id = selectedBrands[0];
        }

        const res = await api.get("/product/paging", { params });

        const responseData = res.data?.data || res.data || {};
        let items: IProduct[] = [];

        if (Array.isArray(responseData)) {
          items = responseData;
        } else if (Array.isArray(responseData.items)) {
          items = responseData.items;
        } else if (Array.isArray(res.data)) {
          items = res.data;
        }

        // Client-side multi-select refinement jika user memilih lebih dari 1 filter
        if (selectedCategories.length > 0) {
          items = items.filter((p) =>
            selectedCategories.includes(String(p.category_id || p.category?.id))
          );
        }
        if (selectedBrands.length > 0) {
          items = items.filter((p) =>
            selectedBrands.includes(String(p.brand_id || p.brand?.id))
          );
        }

        const calculatedTotalPages =
          responseData.totalPages ||
          res.data?.totalPages ||
          Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));

        const calculatedTotalItems =
          responseData.totalItems ?? res.data?.totalItems ?? items.length;

        setTotalPages(calculatedTotalPages);
        setTotalItems(calculatedTotalItems);
        setHasMore(targetPage < calculatedTotalPages && items.length > 0);

        if (isInitial) {
          setProducts(items);
        } else {
          setProducts((prev) => [...prev, ...items]);
        }
      } catch (error) {
        console.error("Gagal memuat produk katalog:", error);
        if (isInitial) setProducts([]);
        setHasMore(false);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedSearch, selectedCategories, selectedBrands]
  );

  // Trigger initial fetch or filter change
  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [fetchProducts]);

  // 4. Infinite Scroll Observer
  useEffect(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          setPage((prevPage) => {
            const nextPage = prevPage + 1;
            fetchProducts(nextPage, false);
            return nextPage;
          });
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [isLoading, isLoadingMore, hasMore, fetchProducts]);

  // Toggle Category Filter
  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Toggle Brand Filter
  const toggleBrand = (id: string) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedCategories([]);
    setSelectedBrands([]);
  };

  const hasActiveFilters =
    search.length > 0 ||
    selectedCategories.length > 0 ||
    selectedBrands.length > 0;

  // Sidebar Filter Component
  const FilterContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#e6eff2] pb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-skin-blue" />
          <h2 className="font-bold text-skin-ink">Filter</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-skin-blue hover:underline"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>

      {/* Kategori Filter */}
      <div className="border-b border-[#e6eff2] pb-5">
        <button
          onClick={() => setCategoryExpanded(!categoryExpanded)}
          className="flex w-full items-center justify-between text-left text-sm font-bold text-skin-ink"
        >
          <span>Kategori</span>
          {categoryExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {categoryExpanded && (
          <div className="mt-3.5 max-h-56 space-y-2 overflow-y-auto pr-1">
            {categories.length === 0 ? (
              <p className="text-xs text-skin-muted">Tidak ada kategori</p>
            ) : (
              categories.map((cat) => {
                const catId = String(cat.id);
                const isChecked = selectedCategories.includes(catId);
                return (
                  <label
                    key={catId}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-1.5 transition-colors hover:bg-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCategory(catId)}
                        className="h-4 w-4 rounded border-[#cde0e7] text-skin-blue focus:ring-skin-blue"
                      />
                      <span
                        className={`text-sm ${
                          isChecked
                            ? "font-semibold text-skin-ink"
                            : "text-skin-muted"
                        }`}
                      >
                        {cat.name}
                      </span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Brand Filter */}
      <div>
        <button
          onClick={() => setBrandExpanded(!brandExpanded)}
          className="flex w-full items-center justify-between text-left text-sm font-bold text-skin-ink"
        >
          <span>Brand</span>
          {brandExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {brandExpanded && (
          <div className="mt-3.5 max-h-56 space-y-2 overflow-y-auto pr-1">
            {brands.length === 0 ? (
              <p className="text-xs text-skin-muted">Tidak ada brand</p>
            ) : (
              brands.map((brand) => {
                const brandId = String(brand.id);
                const isChecked = selectedBrands.includes(brandId);
                return (
                  <label
                    key={brandId}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-2 py-1.5 transition-colors hover:bg-white"
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleBrand(brandId)}
                        className="h-4 w-4 rounded border-[#cde0e7] text-skin-blue focus:ring-skin-blue"
                      />
                      <span
                        className={`text-sm ${
                          isChecked
                            ? "font-semibold text-skin-ink"
                            : "text-skin-muted"
                        }`}
                      >
                        {brand.name}
                      </span>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fcfd]">
      <Navbar />

      <main className="flex-1">
        {/* Top Header Banner */}
        <section className="border-b border-[#e6eff2] bg-gradient-to-b from-skin-sky to-[#f8fcfd] py-10 md:py-14">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <div>
                <span className="inline-flex items-center gap-2 text-[11px] font-extrabold tracking-[0.14em] text-skin-eyebrow">
                  <span className="size-1.5 rounded-full bg-skin-pink" />
                  CURATED DIRECTORY
                </span>
                <h1 className="mt-2 text-3xl font-extrabold text-skin-ink md:text-5xl">
                  Product Catalog
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-skin-muted md:text-base">
                  Temukan produk skincare terkurasi dengan formula teruji dan
                  bahan aktif yang transparan untuk kenyamanan kulitmu.
                </p>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-80">
                <div className="relative flex items-center">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 text-skin-muted"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari nama produk..."
                    className="h-12 w-full rounded-2xl border border-[#d3e5ec] bg-white pl-11 pr-10 text-sm text-skin-ink shadow-sm placeholder:text-skin-muted/70 focus:border-skin-blue focus:outline-none focus:ring-2 focus:ring-skin-blue/20"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3.5 grid size-6 place-items-center rounded-full text-skin-muted hover:bg-gray-100 hover:text-skin-ink"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
          {/* Mobile Filter Toggle */}
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <span className="text-sm font-medium text-skin-muted">
              {totalItems} produk ditemukan
            </span>
            <Button
              variant="secondary"
              size="sm"
              onPress={() => setIsMobileFilterOpen(true)}
              className="gap-2 rounded-xl font-semibold"
            >
              <Filter size={15} />
              Filter{" "}
              {selectedCategories.length + selectedBrands.length > 0 &&
                `(${selectedCategories.length + selectedBrands.length})`}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Desktop Left Sidebar Filter */}
            <aside className="hidden lg:col-span-1 lg:block">
              <div className="sticky top-24 rounded-3xl border border-[#e6eff2] bg-[#fdfefe] p-5 shadow-sm">
                <FilterContent />
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="lg:col-span-3">
              {/* Active Filter Pills Bar */}
              {hasActiveFilters && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-skin-muted">
                    Filter aktif:
                  </span>
                  {search && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-medium text-skin-ink shadow-sm ring-1 ring-[#e0edf2]">
                      "{search}"
                      <button onClick={() => setSearch("")}>
                        <X size={12} />
                      </button>
                    </span>
                  )}
                  {selectedCategories.map((catId) => {
                    const cat = categories.find((c) => String(c.id) === catId);
                    return (
                      <span
                        key={catId}
                        className="inline-flex items-center gap-1.5 rounded-full bg-skin-sky px-3 py-1 text-xs font-medium text-skin-blue shadow-sm ring-1 ring-[#cce3ee]"
                      >
                        {cat?.name || "Kategori"}
                        <button onClick={() => toggleCategory(catId)}>
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                  {selectedBrands.map((brandId) => {
                    const brand = brands.find((b) => String(b.id) === brandId);
                    return (
                      <span
                        key={brandId}
                        className="inline-flex items-center gap-1.5 rounded-full bg-skin-pink-tile px-3 py-1 text-xs font-medium text-skin-pink shadow-sm ring-1 ring-[#f4dbe5]"
                      >
                        {brand?.name || "Brand"}
                        <button onClick={() => toggleBrand(brandId)}>
                          <X size={12} />
                        </button>
                      </span>
                    );
                  })}
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-skin-muted hover:text-skin-blue hover:underline"
                  >
                    Hapus Semua
                  </button>
                </div>
              )}

              {/* Initial Loading Skeletons */}
              {isLoading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="flex h-72 flex-col rounded-3xl border border-[#e8f1f5] bg-white p-3.5 shadow-sm"
                    >
                      <div className="aspect-square w-full animate-pulse rounded-2xl bg-gray-100" />
                      <div className="mt-3.5 space-y-2">
                        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                        <div className="h-4 w-4/5 animate-pulse rounded bg-gray-200" />
                        <div className="mt-2 h-5 w-16 animate-pulse rounded-full bg-gray-100" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#cfe1e8] bg-white/70 py-16 px-6 text-center shadow-sm">
                  <div className="grid size-16 place-items-center rounded-3xl bg-skin-sky text-skin-blue">
                    <PackageOpen size={30} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-skin-ink">
                    Tidak ada produk yang cocok
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-skin-muted">
                    Coba sesuaikan kata kunci pencarian atau bersihkan filter
                    kategori dan brand untuk melihat produk lainnya.
                  </p>
                  {hasActiveFilters && (
                    <Button
                      onPress={handleResetFilters}
                      variant="secondary"
                      size="sm"
                      className="mt-5 gap-2 rounded-xl font-semibold"
                    >
                      <RotateCcw size={14} />
                      Reset Semua Filter
                    </Button>
                  )}
                </div>
              ) : (
                /* Products Grid */
                <>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-3">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id || `${product.product_name}-${Math.random()}`}
                        product={product}
                      />
                    ))}
                  </div>

                  {/* Infinite Scroll Sentinel & Loader */}
                  <div ref={observerTarget} className="mt-10 py-4 text-center">
                    {isLoadingMore && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-medium text-skin-muted shadow-sm ring-1 ring-[#e0edf2]">
                        <Loader2 size={16} className="animate-spin text-skin-blue" />
                        <span>Memuat lebih banyak produk...</span>
                      </div>
                    )}

                    {!hasMore && products.length > 0 && (
                      <p className="text-xs font-medium text-skin-muted/70">
                        ✨ Semua produk telah ditampilkan ({products.length} produk)
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Mobile Filter Drawer / Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#e6eff2] pb-3">
              <span className="font-bold text-skin-ink">Filter Produk</span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="grid size-8 place-items-center rounded-full text-skin-muted hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <FilterContent />
            </div>

            <div className="mt-4 border-t border-[#e6eff2] pt-4">
              <Button
                onPress={() => setIsMobileFilterOpen(false)}
                className="w-full rounded-2xl bg-skin-blue font-bold text-white shadow"
              >
                Terapkan Filter
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}


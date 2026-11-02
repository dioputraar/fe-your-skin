"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import api from "@/lib/api";
import { useEffect, useState } from "react";
import * as Icon from "lucide-react";
import { Button } from "@heroui/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableSkeleton from "@/components/skeleton/TableSkeleton"

interface DataTableProps<TData = any, TValue = any> {
  columns: ColumnDef<TData, TValue>[];
  url: string;
  isRefresh?: boolean;
}

export const DataTable = ({
  columns,
  url,
  isRefresh = false,
}: DataTableProps) => {
  // 1. STATE DASAR
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State Pagination & Pencarian
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [order, setOrder] = useState<string>("");

  // State Meta Data dari API
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);

  // 2. INISIALISASI TANSTACK TABLE
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // 3. LOGIKA FETCHING DATA (Server-side)
  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(url, {
          params: { page, limit, search, sort, order },
        });

        console.log(res.data);
        const rows = res?.data ? res.data.data : [];

        // Menambahkan nomor urut ke dalam data
        const numberedData = rows.map((item: any, index: number) => ({
          ...item,
          number: (page - 1) * limit + index + 1,
        }));

        setData(numberedData);
        setTotalPages(res?.data?.data?.totalPages ?? 1);
        setTotalItems(res?.data?.data?.totalItems ?? 0);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      getData();
    }
  }, [page, limit, search, sort, order, url, isRefresh]);

  // 4. LOGIKA TOMBOL PAGINATION
  const renderPagination = () => {
    const pageNumbers: (number | string)[] = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === page || i === totalPages) {
        pageNumbers.push(i);
      } else if (i === page - 1 || i === page + 1) {
        pageNumbers.push(i);
      } else if (i === page - 2 || i === page + 2) {
        pageNumbers.push("...");
      }
    }
    return pageNumbers;
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Mencegah hydration mismatch dari UI server vs client
  }

  // 5. RENDER UI
  return (
    <div className="grid gap-5 lg:gap-7.5 text-sm text-skin-ink">
      <div className="min-w-full rounded-2xl bg-white shadow-sm ring-1 ring-[#e6eff2]">

        {/* === HEADER: INFORMASI TOTAL & PENCARIAN === */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#e6eff2] sticky top-[60px] md:top-[70px] z-10 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="text-sm text-skin-muted">{totalItems} entri tercatat</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-2xl border border-[#d9e6ec] bg-white px-4 py-2.5 text-skin-muted shadow-sm focus-within:border-skin-blue sm:min-w-[280px]">
              <Icon.Search size={16} />
              <input
                className="w-full bg-transparent text-sm text-skin-ink outline-none placeholder:text-skin-muted"
                placeholder="Cari data..."
                type="text"
                value={search}
                onChange={(e) => {
                  setPage(1); // Reset ke halaman 1 setiap kali mencari
                  setSearch(e.target.value);
                }}
              />
            </label>
          </div>
        </div>

        {/* === BODY: TABEL DATA === */}
        <div className="p-4">
          <div className="overflow-x-auto rounded-2xl border border-[#e6eff2]">
            {isLoading ? (
              <TableSkeleton columns={columns.length} limit={limit} />
            ) : (
              <Table>
                <TableHeader className="bg-skin-sky/60">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-[#e6eff2] hover:bg-transparent">
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className={`px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-skin-eyebrow ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                          onClick={() => {
                            if (!header.column.getCanSort()) return;
                            setSort(header.column.id);
                            setOrder(order === "asc" ? "desc" : "asc");
                          }}
                        >
                          <div className="flex items-center gap-1.5">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <Icon.ArrowUpDown size={13} className="text-skin-muted" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map((row, index) => (
                      <TableRow key={row.id} className="border-[#eef4f6] hover:bg-skin-sky/40">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-6 py-4">
                            {cell.column.id === "No" || cell.column.id === "number"
                              ? page * limit - limit + index + 1
                              : flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        Tidak ada data ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* === FOOTER: PAGINATION & LIMIT === */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-[#e6eff2] bg-gray-50/50 rounded-b-2xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm font-medium text-skin-muted">
              Menampilkan {totalItems === 0 ? 0 : (page - 1) * limit + 1} sampai{" "}
              {Math.min(page * limit, totalItems)} dari {totalItems} entri
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-skin-muted">
              <label htmlFor="table-limit">Baris</label>
              <select
                id="table-limit"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setSort("");
                  setOrder("");
                  setPage(1); // Reset halaman jika limit diubah
                }}
                className="rounded-xl border border-[#d9e6ec] bg-white px-2 py-1.5 text-sm text-skin-ink outline-none transition focus:border-skin-blue focus:ring-2 focus:ring-skin-blue/20"
              >
                {[5, 10, 25, 50, 100].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="tertiary"
              isDisabled={isLoading || page === 1}
              onPress={() => setPage(1)}
            >
              <Icon.ChevronsLeft size={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="tertiary"
              isDisabled={isLoading || page === 1}
              onPress={() => setPage(page - 1)}
            >
              <Icon.ChevronLeft size={16} />
            </Button>

            {renderPagination().map((number, index) => (
              <Button
                key={index}
                isIconOnly={typeof number === "number"}
                size="sm"
                variant={number === page ? "primary" : "tertiary"}
                isDisabled={isLoading || typeof number === "string"}
                className={number === page ? "bg-skin-blue text-white" : ""}
                onPress={() => typeof number === "number" && setPage(number)}
              >
                {number}
              </Button>
            ))}

            <Button
              isIconOnly
              size="sm"
              variant="tertiary"
              isDisabled={isLoading || page === totalPages}
              onPress={() => setPage(page + 1)}
            >
              <Icon.ChevronRight size={16} />
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="tertiary"
              isDisabled={isLoading || page === totalPages}
              onPress={() => setPage(totalPages)}
            >
              <Icon.ChevronsRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
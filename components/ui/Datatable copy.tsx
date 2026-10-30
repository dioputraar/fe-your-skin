"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
  OnChangeFn,
  VisibilityState,
} from "@tanstack/react-table";
import axios from "axios";
import clsx from "clsx";
import { useEffect, useRef, useState, useCallback } from "react";
import Cookies from "js-cookie";
import TableSkeleton from "@/components/skeleton/TableSkeleton";
import GridSkeleton from "@/components/skeleton/GridSkeleton";
import {
  Select,
  Label,
  ListBox,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react";
import DynamicSelect from "@/components/ui/DynamicSelect";
import * as Icon from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FilterConfig {
  column: string;
  value: string;
}

interface DataTableProps<TData = any, TValue = any> {
  columns: ColumnDef<TData, TValue>[];
  url?: string;
  isRefresh?: boolean;
  setIsRefresh?: (val: boolean) => void;
  exportFormats?: string[];
  customURL?: boolean;
  isFilter?: boolean;
  onDataChange?: (data: TData[]) => void;
  data?: TData[]; // Added for local data mode
}

export const DataTable = ({
  columns,
  url,
  isRefresh = false,
  setIsRefresh,
  exportFormats = [],
  customURL = false,
  isFilter = false,
  onDataChange,
  data: initialData,
}: DataTableProps) => {
  const [data, setData] = useState<any[]>(initialData || []);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(initialData ? initialData.length : 0);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [order, setOrder] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [filters, setFilters] = useState<FilterConfig[]>([]);
  const rowRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const lastIndex = useRef<number | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    columns
      .map(c => c.header as string)
      .filter(header => header !== "No" && header !== "Action")
  );

  const token = Cookies.get("token");
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const route = customURL ? `${url}` : `${url}-paging`;
  const visibleColumnsCount = table
    .getAllLeafColumns()
    .filter((col) => col.getIsVisible()).length;

  const stableOnDataChange = useCallback(
    (fetchedData: any[]) => {
      if (typeof onDataChange === "function") {
        onDataChange(fetchedData);
      }
    },
    [onDataChange]
  );

  useEffect(() => {
    if (!url) {
      if (initialData) {
        setData(initialData);
        setTotalItems(initialData.length);
        setTotalPages(Math.ceil(initialData.length / limit));
      }
      return;
    }

    const getData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(route, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit, search, sort, order, filters },
        });

        const rows = res?.data?.data?.data ?? [];
        const numberedData = rows.map((item: any, index: number) => ({
          ...item,
          number: (page - 1) * limit + index + 1,
        }));

        setData(numberedData);
        setTotalPages(res?.data?.data?.totalPages ?? 1);
        setTotalItems(res?.data?.data?.totalItems ?? 0);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    getData();
  }, [page, limit, search, sort, order, url, isRefresh, token, filters, route, initialData]);

  useEffect(() => {
    if (data.length > 0) {
      stableOnDataChange(data);
    }
  }, [data, stableOnDataChange]);

  useEffect(() => {
    if (data.length > 0) {
      lastIndex.current = data.length - 1;
    }
  }, [data]);

  useEffect(() => {
    if (lastIndex.current !== null) {
      const rowElement = rowRefs.current[lastIndex.current];
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [limit]);

  const handleExport = async (format: string) => {
    try {
      if (!url || exportFormats.length === 0) {
        console.error("Export URL is not provided");
        return;
      }
      const res = await axios.get(`${url}-export`, {
        responseType: "blob",
      });

      const contentDisposition = res.headers["content-disposition"];
      let filename = `data.${format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="([^"]+)"/);
        if (match && match[1]) {
          filename = decodeURIComponent(match[1]);
        }
      }

      const downloadUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      link.setAttribute("rel", "noopener noreferrer");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const addFilter = () => {
    setFilters([...filters, { column: "", value: "" }]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
    if (setIsRefresh) setIsRefresh(!isRefresh);
  };

  const updateFilter = (index: number, key: keyof FilterConfig, value: string) => {
    setFilters(
      filters.map((filter, i) =>
        i === index ? { ...filter, [key]: value } : filter
      )
    );
  };

  const renderPagination = () => {
    const pageNumbers: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === page || i === totalPages) {
        pageNumbers.push(i);
      } else {
        if (i === page - 1 || i === page + 1) {
          pageNumbers.push(i);
        } else if (i === page - 2 || i === page + 2) {
          pageNumbers.push("...");
        }
      }
    }

    return pageNumbers;
  };

  const columnOptions = columns
    .filter((col: any) => col.accessorKey)
    .map((col: any) => ({
      key: col.accessorKey,
      label: col.header as string,
    }));

  return (
    <div className="grid gap-5 lg:gap-7.5 text-sm text-skin-ink">
      <div className="min-w-full rounded-2xl bg-white shadow-sm ring-1 ring-[#e6eff2]">
        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#e6eff2] sticky top-[60px] md:top-[70px] z-10 bg-white rounded-t-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-skin-muted">{totalItems} entri tercatat</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Searchbar */}
            <label className="flex min-w-[220px] flex-1 items-center gap-2.5 rounded-2xl border border-[#d9e6ec] bg-white px-4 py-2.5 text-skin-muted shadow-sm focus-within:border-skin-blue sm:min-w-[280px]">
              <Icon.Search size={16} />
              <input
                className="w-full bg-transparent text-sm text-skin-ink outline-none placeholder:text-skin-muted"
                placeholder="Cari data..."
                type="text"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </label>

            {/* Column visibility */}
            <Dropdown>
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl border-[#d9e6ec] px-4 py-2.5"
              >
                <Icon.Columns size={16} />
                <span className="hidden sm:inline">Column</span>
                <span className="ml-1 rounded-full bg-skin-sky px-2 py-0.5 text-xs font-bold text-skin-blue">
                  {visibleColumnsCount}
                </span>
              </Button>
              <Dropdown.Popover>
                <Dropdown.Menu
                  selectedKeys={visibleColumns}
                  selectionMode="multiple"
                  onSelectionChange={ }
                >
                  {/* <Header>Select Visible Column</Header> */}
                  {table.getAllLeafColumns().map((column) => (
                    <Dropdown.Item id={column.id} >
                      <Dropdown.ItemIndicator />
                      <Label>{column.columnDef.header as string}</Label>
                      {/* <label className="flex w-full cursor-pointer items-center justify-between px-2 py-1.5 hover:bg-skin-sky/40 rounded-md">
                        {column.columnDef.header as string}
                        <input
                          type="checkbox"
                          className="ml-2 rounded border-skin-muted text-skin-blue focus:ring-skin-blue"
                          checked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                        />
                      </label> */}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>

            {/* Export Button */}
            {exportFormats.length > 0 && (
              <Dropdown>
                <DropdownTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[#d9e6ec] px-4 py-2.5"
                  >
                    <Icon.Printer size={16} />
                    <span className="hidden sm:inline">Ekspor</span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Export Formats">
                  {exportFormats.map((format) => (
                    <DropdownItem
                      key={format}
                      onPress={() => handleExport(format)}
                    >
                      <Icon.Download />
                      Export {format.toUpperCase()}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            )}

            {/* Filter */}
            {isFilter && (
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-[#d9e6ec] px-4 py-2.5"
                  >
                    <Icon.Settings size={16} />
                    <span className="hidden sm:inline">Filter</span>
                    {filters.length > 0 && (
                      <span className="ml-1 rounded-full bg-skin-sky px-2 py-0.5 text-xs font-bold text-skin-blue">
                        {filters.length}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[340px] md:w-[450px]">
                  <div className="w-full p-4">
                    <div className="mb-4 text-sm font-semibold text-skin-ink border-b border-[#e6eff2] pb-2">
                      Filter
                    </div>
                    <div className="flex flex-col gap-3">
                      {filters.map((filter, index) => {
                        const selectedColumn = columns.find(
                          (col: any) => col.accessorKey === filter.column
                        ) as any;

                        return (
                          <div key={index} className="flex flex-wrap items-center gap-2">
                            <Select
                              className="flex-1 min-w-[120px]"
                              placeholder="Pilih kolom"
                              value={filter.column || null}
                              variant="primary"
                              onChange={(value) =>
                                updateFilter(index, "column", String(value ?? ""))
                              }
                            >
                              <Label>Kolom</Label>
                              <Select.Trigger>
                                <Select.Value />
                                <Select.Indicator />
                              </Select.Trigger>
                              <Select.Popover>
                                <ListBox>
                                  {columnOptions.map((item) => (
                                    <ListBox.Item
                                      key={item.key}
                                      id={item.key}
                                      textValue={item.label}
                                    >
                                      {item.label}
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                  ))}
                                </ListBox>
                              </Select.Popover>
                            </Select>

                            {/* NOTE: DynamicSelect usage below is unchanged from your
                                original code — I couldn't verify its prop contract
                                (no source provided), but `value={selectedColumn.accessorKey}`
                                looks suspicious: that's a static column key, not the
                                currently selected filter value. Worth double-checking
                                against DynamicSelect's own implementation. */}
                            {selectedColumn?.accessorKey && url && (
                              <div className="flex-1 min-w-[140px]">
                                <DynamicSelect
                                  id={`value-${index}`}
                                  url={route}
                                  usePagination={true}
                                  placeholder="Pilih nilai"
                                  className="w-full text-sm"
                                  value={selectedColumn.accessorKey}
                                  label={[selectedColumn.accessorKey]}
                                  onChange={(selected: any) => {
                                    updateFilter(index, "value", selected?.value || "");
                                  }}
                                />
                              </div>
                            )}

                            <Button
                              isIconOnly
                              variant="danger-soft"
                              size="sm"
                              onPress={() => removeFilter(index)}
                            >
                              <Icon.Trash2 size={16} />
                            </Button>
                          </div>
                        );
                      })}
                      {filters.length === 0 && (
                        <p className="text-sm text-skin-muted">
                          Belum ada filter. Klik &quot;Tambah Filter&quot; untuk mulai.
                        </p>
                      )}
                    </div>
                    <div className="mt-5 flex justify-end gap-2">
                      <Button size="sm" variant="tertiary" onPress={addFilter}>
                        <Icon.Plus size={16} /> Tambah Filter
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-skin-blue text-white"
                        onPress={() => setIsRefresh?.(!isRefresh)}
                      >
                        <Icon.Check size={16} /> Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Body Table */}
        <div className="p-4">
          {viewMode === "grid" && (
            <>
              {isLoading ? (
                <GridSkeleton column={visibleColumns.length} limit={limit} />
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.map((item, index) => {
                    const actionColumn = columns.find(
                      (col: any) => col.header === "Action" || col.id === "actions"
                    );

                    return (
                      <div
                        key={index}
                        className="rounded-xl border border-[#e6eff2] bg-white p-4 shadow-sm"
                        ref={(el) => {
                          rowRefs.current[index] = el;
                        }}
                      >
                        <div className="flex flex-col gap-3">
                          {columns.map(
                            (column: any, colIndex: number) =>
                              column.accessorKey && (
                                <div className="grid grid-cols-2 gap-2 text-sm" key={colIndex}>
                                  <span className="font-medium text-skin-muted">
                                    {column.header}
                                  </span>
                                  <span className="text-skin-ink text-right">
                                    {column.cell && item[column.accessorKey]
                                      ? flexRender(column.cell, { row: { original: item } } as any)
                                      : item[column.accessorKey] || "-"}
                                  </span>
                                </div>
                              )
                          )}
                        </div>

                        {/* Render Action Buttons */}
                        {actionColumn && (
                          <div className="mt-4 flex justify-end border-t border-[#e6eff2] pt-3">
                            {actionColumn.cell &&
                              flexRender(actionColumn.cell, { row: { original: item } } as any)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {viewMode === "table" && (
            <div className="overflow-x-auto rounded-2xl border border-[#e6eff2]">
              {isLoading ? (
                <TableSkeleton limit={limit} />
              ) : (
                <Table>
                  <TableHeader className="bg-skin-sky/60">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-[#e6eff2] hover:bg-transparent">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className={clsx(
                              "px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-skin-eyebrow",
                              header.column.getCanSort() && "cursor-pointer select-none"
                            )}
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
                        <TableRow
                          key={row.id}
                          className="border-[#eef4f6] hover:bg-skin-sky/40"
                          ref={(el) => {
                            rowRefs.current[row.index] = el;
                          }}
                        >
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
          )}
        </div>

        {/* FOOTER / PAGINATION */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-[#e6eff2] bg-gray-50/50 rounded-b-2xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="text-sm font-medium text-skin-muted">
              Menampilkan {(page - 1) * limit + 1} sampai{" "}
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
                  setPage(1);
                }}
                className="rounded-xl border border-[#d9e6ec] bg-white px-2 py-1.5 text-sm text-skin-ink outline-none transition focus:border-skin-blue focus:ring-2 focus:ring-skin-blue/20"
              >
                {[5, 10, 25, 50, 100, 200].map((item) => (
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
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import clsx from "clsx";
import { useEffect, useRef, useState, useCallback } from "react";
import Cookies from "js-cookie";
import TableSkeleton from "../skeleton/TableSkeleton";
import GridSkeleton from "../skeleton/GridSkeleton";
import Select from "react-select";
import DynamicSelect from "./FilterSelect";

const DataTable = ({
  columns,
  url,
  isRefresh = false,
  setIsRefresh,
  exportFormats = [],
  customURL = false,
  isFilter = false,
  columnVisibility,
  setColumnVisibility,
  onDataChange
}) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [order, setOrder] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [filters, setFilters] = useState<
    Array<{ column: string; value: string }>
  >([]);
  const rowRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const lastIndex = useRef<number | null>(null);

  const token = Cookies.get("token");
  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility: columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });  
  const route = customURL ? `${url}` : `${url}-paging`;
  const visibleColumnsCount = table.getAllLeafColumns().filter(col => col.getIsVisible()).length;

  // Memoize onDataChange untuk menghindari infinite re-render
  const stableOnDataChange = useCallback((data) => {
    if (typeof onDataChange === "function") {
      onDataChange(data);
    }
  }, [onDataChange]);

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(route, {
          headers: { Authorization: `Bearer ${token}` },
          params: { page, limit, search, sort, order, filters },
        });

        const rows = res?.data?.data?.data ?? [];
        const numberedData = rows.map((item, index) => ({
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
  }, [page, limit, search, sort, order, url, isRefresh, token, filters, route]);

  // Separate useEffect untuk onDataChange
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
      if (exportFormats.length === 0) {
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
    setIsRefresh(!isRefresh);
  };

  const updateFilter = (index: number, key: string, value: string) => {
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

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="card card-grid min-w-full">
        <div className="card-header bg-white dark:bg-coal-600 flex flex-wrap gap-2 z-5 sticky top-[60px] md:top-[70px] justify-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Limit */}
            <div className="flex gap-2 font-medium text-sm items-center">
              <label>Show</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setSort("");
                  setOrder("");
                  setPage(1);
                }}
                className={clsx(
                  "select select-sm w-16",
                  "focus:outline focus:outline-1"
                )}
              >
                {[5, 10, 25, 50, 100, 200].map((item) => {
                  return (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  );
                })}
              </select>
            </div>
            {/* <div className="border border-solid border-gray-300 box-border my-1"></div> */}
            {/* View Mode */}
            {/* <div className="btn-tabs btn-tabs-sm" data-tabs="true">
              <button
                onClick={() => setViewMode("table")}
                className={clsx(
                  "btn btn-icon",
                  viewMode === "table" ? "active" : ""
                )}
              >
                <i className="ki-filled ki-row-horizontal"></i>
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={clsx(
                  "btn btn-icon",
                  viewMode === "grid" ? "active" : ""
                )}
              >
                <i className="ki-filled ki-category"></i>
              </button>
            </div> */}
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-center justify-center">
            {/* Searchbar */}
            <div className="flex justify-between flex-1">
              <label className="input input-sm">
                <i className="ki-filled ki-magnifier"></i>
                <input
                  data-datatable-search="#team_crew_table"
                  placeholder="Search..."
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setPage(1);
                    setSearch(e.target.value);
                  }}
                />
              </label>
            </div>

            {/* Column visibility */}
            <div
              className="dropdown"
              data-dropdown="true"
              data-dropdown-trigger="click"
              data-dropdown-placement="bottom-start"
            >
              <button
                className={clsx(
                  "dropdown-toggle btn btn-sm btn-outline btn-primary", 
                  "flex items-center gap-1"                             
                )}
              >
                <i className="ki-filled ki-filter text-base" />
                <span>Column visibility</span>

                {/* badge */}
                <span className="badge badge-sm bg-blue-100 text-blue-600 ml-1 rounded-md px-2 py-[2px]">
                  {visibleColumnsCount}
                </span>
              </button>

              {/* menu */}
              <div className="dropdown-content w-64 shadow-lg bg-white rounded-md z-[1000]">
                <div className="p-4 flex flex-col gap-1 max-h-60 overflow-y-auto">
                  {table.getAllLeafColumns().map((column) => (
                    <label
                      key={column.id}
                      className="flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {column.columnDef.header as string}
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Export Button */}
            {exportFormats.length > 0 && (
              <>
                {/* <div className="border border-solid border-gray-300 box-border my-1 hidden md:block"></div> */}
                <div className="flex gap-2 hidden md:block">
                  <div
                    className="dropdown"
                    data-dropdown="true"
                    data-dropdown-trigger="click"
                    data-dropdown-placement="bottom-end"
                    data-dropdown-permanent="true"
                  >
                    <button className="dropdown-toggle btn btn-sm btn-outline btn-primary">
                      <i className="ki-filled ki-printer"></i>
                      Exports
                    </button>
                    <div className="dropdown-content w-100">
                      <div className="p-4">
                        <div className="flex flex-col gap-2 mb-3 min-w-fit">
                          <div className="flex gap-2">
                            {exportFormats.map((format) => (
                              <button
                                key={format}
                                onClick={() => handleExport(format)}
                                className="btn btn-sm btn-outline btn-primary"
                              >
                                <i className="ki-filled ki-file-down"></i>
                                Export {format.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 block sm:hidden">
                  <button
                    className="btn btn-sm btn-outline btn-primary"
                    data-drawer-toggle="#drawer_2"
                  >
                    <i className="ki-filled ki-printer"></i>
                    Exports
                  </button>
                </div>
              </>
            )}

            {/* Filter */}
            {isFilter && (
              <>
                {/* <div className="border border-solid border-gray-300 box-border my-1"></div> */}
                <div className="flex gap-2 hidden md:block">
                  <div
                    className="dropdown"
                    data-dropdown="true"
                    data-dropdown-trigger="click"
                    data-dropdown-placement="bottom-end"
                    data-dropdown-permanent="true"
                  >
                    <button className="dropdown-toggle btn btn-sm btn-outline btn-primary">
                      <i className="ki-filled ki-setting-4"></i>
                      Filters
                    </button>
                    <div className="dropdown-content w-100">
                      <div className="p-4 text-xs text-gray-900 font-medium">
                        Filter
                      </div>
                      <div className="border-b border-b-gray-200"></div>
                      <div className="p-4">
                        <div className="flex flex-col gap-2 mb-3 min-w-fit">
                          {filters.map((filter, index) => {
                            const selectedColumn = columns.find(
                              (col) => col.accessorKey === filter.column
                            );

                            return (
                              <div key={index} className="flex items-center gap-2">
                                <Select
                                  options={columns
                                    .filter((col) => col.accessorKey)
                                    .map((col) => ({
                                      value: col.accessorKey,
                                      label: col.header,
                                    }))}
                                  value={{
                                    value: filter.column,
                                    label:
                                      columns.find(
                                        (col) =>
                                          col.accessorKey === filter.column &&
                                          col.accessorKey != ""
                                      )?.header || "Select Column",
                                  }}
                                  onChange={(selected) =>
                                    updateFilter(index, "column", selected?.value || "")
                                  }
                                  className="text-xs flex-1"
                                  isSearchable={false}
                                />
                                
                                {selectedColumn?.accessorKey && (
                                  <DynamicSelect
                                    key={`${filter.column}-${index}`}
                                    id={`value-${index}`}
                                    url={route}
                                    usePagination={true}
                                    placeholder="Select Value"
                                    className="text-xs flex-1 min-w-[200px]"
                                    value={selectedColumn.accessorKey}
                                    label={[selectedColumn.accessorKey]}
                                    onChange={(selected) => {
                                      updateFilter(index, "value", selected?.value || "");
                                    }}
                                  />
                                )}
                                
                                <button
                                  onClick={() => removeFilter(index)}
                                  className="btn btn-outline btn-secondary"
                                >
                                  <i className="ki-filled ki-trash"></i>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={addFilter}
                            className="btn btn-sm btn-outline btn-primary"
                          >
                            <i className="ki-filled ki-plus"></i> Add Filter
                          </button>
                          <button
                            onClick={() => setIsRefresh(!isRefresh)}
                            className="btn btn-sm btn-primary"
                          >
                            <i className="ki-filled ki-check"></i> Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 block sm:hidden">
                  <button
                    className="btn btn-sm btn-outline btn-primary"
                    data-drawer-toggle="#drawer_1"
                  >
                    <i className="ki-filled ki-setting-4"></i>
                    Filters
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="card-body">
          {/* Grid */}
          {viewMode === "grid" && (
            <>
              {isLoading ? (
                <GridSkeleton column={columns.length} limit={limit} />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {data.map((item, index) => {
                    const actionColumn = columns.find(
                      (col) => col.header === "Action"
                    );

                    return (
                      <div
                        key={index}
                        className="card shadow"
                        ref={(el) => {
                          rowRefs.current[index] = el;
                        }}
                      >
                        <div className="card-body">
                          {columns.map(
                            (column, colIndex) =>
                              column.accessorKey !== "" && (
                                <div className="m-4" key={colIndex}>
                                  <div className="grid grid-cols-2 gap-1">
                                    <label className="font-light text-xs">
                                      {column.header}
                                    </label>
                                    <div className="font-normal text-xs">
                                      {column.cell && item[column.accessorKey]
                                        ? column.cell({
                                            row: { original: item },
                                          })
                                        : item[column.accessorKey] || "-"}
                                    </div>
                                  </div>
                                </div>
                              )
                          )}
                        </div>

                        {/* Render Action Buttons */}
                        {actionColumn && (
                          <div className="card-footer flex justify-end space-x-2">
                            {actionColumn.cell &&
                              actionColumn.cell({ row: { original: item } })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* Table */}
          {viewMode === "table" && (
            <div className="scrollable-x-auto">
              {isLoading ? (
                <TableSkeleton limit={limit} />
              ) : (
                <table className="table table-border table-sm">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="p-2 cursor-pointer select-none text-center"
                            onClick={() => {
                              if (!header.column.getCanSort()) return;
                              setSort(header.column.id);
                              setOrder(order === "asc" ? "desc" : "asc");
                            }}
                          >
                            <span
                              className={
                                header.column.getCanSort() &&
                                sort === header.column.id
                                  ? order === "asc"
                                    ? "sort asc"
                                    : "sort desc"
                                  : "sort"
                              }
                            >
                              <span className="sort-label font-bold text-md">
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </span>
                              {header.column.getCanSort() && (
                                <span className="sort-icon"></span>
                              )}
                            </span>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row, index) => (
                        <tr
                          key={row.id}
                          className="text-sm font-normal"
                          ref={(el) => {
                            rowRefs.current[row.index] = el;
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className={`p-2 ${
                                cell.column.id === "No" ? "text-center" : ""
                              }`}
                            >
                              {cell.column.id === "No"
                                ? page * limit - limit + index + 1
                                : flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={columns.length}
                          className="text-center p-4"
                        >
                          No results found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          )}
          <div className="card-footer justify-center md:justify-between flex-col md:flex-row gap-5 text-gray-600 text-2sm font-medium">
            <div className="flex items-center gap-2 order-2 md:order-1">
              <h3 className="font-medium text-sm">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, totalItems)} of {totalItems} entries
              </h3>
            </div>
            {/* Pagination */}
            <div className="flex items-center gap-2 xs:gap-1 order-1 md:order-2">
              <button
                disabled={isLoading || page === 1}
                onClick={() => setPage(1)}
                className="btn btn-sm hover:bg-slate-100"
              >
                <i className="ki-outline ki-double-left"></i>
              </button>
              <button
                disabled={isLoading || page === 1}
                onClick={() => setPage(page - 1)}
                className="btn btn-sm hover:bg-slate-100"
              >
                <i className="ki-outline ki-left"></i>
              </button>

              {renderPagination().map((number, index) => (
                <button
                  key={index}
                  onClick={() => typeof number === "number" && setPage(number)}
                  disabled={isLoading || typeof number === "string"}
                  className={clsx(
                    "btn btn-sm btn-light",
                    number === page && " font-bold",
                    "hover:bg-slate-100"
                  )}
                >
                  {number}
                </button>
              ))}

              <button
                disabled={isLoading || page === totalPages}
                onClick={() => setPage(page + 1)}
                className="btn btn-sm hover:bg-slate-100"
              >
                <i className="ki-outline ki-right"></i>
              </button>
              <button
                disabled={isLoading || page === totalPages}
                onClick={() => setPage(totalPages)}
                className="btn btn-sm hover:bg-slate-100"
              >
                <i className="ki-outline ki-double-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* container filter */}
      <div
        className="drawer drawer-top flex flex-col w-full"
        data-drawer="true"
        id="drawer_1"
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-base font-semibold text-gray-900">Filter</h3>
          <button
            className="btn btn-xs btn-icon btn-light"
            data-drawer-dismiss="true"
          >
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>
        <div className="p-5">
          <div className="flex flex-col gap-2 mb-3 min-w-fit">
            {filters.map((filter, index) => {
              const selectedColumn = columns.find(
                (col) => col.accessorKey === filter.column
              );

              return (
                <div key={index} className="flex items-center gap-2">
                  <Select
                    options={columns
                      .filter((col) => col.accessorKey)
                      .map((col) => ({
                        value: col.accessorKey,
                        label: col.header,
                      }))}
                    value={{
                      value: filter.column,
                      label:
                        columns.find(
                          (col) =>
                            col.accessorKey === filter.column &&
                            col.accessorKey != ""
                        )?.header || "Select Column",
                    }}
                    onChange={(selected) =>
                      updateFilter(index, "column", selected?.value || "")
                    }
                    className="text-xs flex-1"
                    isSearchable={false}
                  />
                  
                  {selectedColumn?.accessorKey && (
                    <DynamicSelect
                      key={`${filter.column}-${index}`}
                      id={`mobile-value-${index}`}
                      url={route}
                      usePagination={true}
                      placeholder="Select Value"
                      className="text-xs flex-1 min-w-[45vw]"
                      value={selectedColumn.accessorKey}
                      label={[selectedColumn.accessorKey]}
                      onChange={(selected) => {
                        updateFilter(index, "value", selected?.value || "");
                      }}
                    />
                  )}
                  
                  <button
                    onClick={() => removeFilter(index)}
                    className="btn btn-outline btn-secondary"
                  >
                    <i className="ki-filled ki-trash"></i>
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 justify-end mt-3">
            <button
              onClick={addFilter}
              className="btn btn-sm btn-outline btn-primary"
            >
              <i className="ki-filled ki-plus"></i> Add Filter
            </button>
            <button
              onClick={() => setIsRefresh(!isRefresh)}
              className="btn btn-sm btn-primary"
              data-drawer-dismiss="true"
            >
              <i className="ki-filled ki-check"></i> Apply
            </button>
          </div>
        </div>
      </div>
      {/* container export */}
      <div
        className="drawer drawer-top flex flex-col w-full"
        data-drawer="true"
        id="drawer_2"
      >
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-base font-semibold text-gray-900">Export</h3>
          <button
            className="btn btn-xs btn-icon btn-light"
            data-drawer-dismiss="true"
          >
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>
        <div className="p-5">
          <div className="flex justify-end gap-2">
            {exportFormats.map((format) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                className="btn btn-sm btn-outline btn-primary"
              >
                <i className="ki-filled ki-file-down"></i>
                Export {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
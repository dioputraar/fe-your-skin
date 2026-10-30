import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axios from "axios";
import clsx from "clsx";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import TableSkeleton from "../skeleton/TableSkeleton";

const DataTable = ({ columns, url, isRefresh = false }) => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [limit, setLimit] = useState<number>(10);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [order, setOrder] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<string>("table"); // Default table
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const token = Cookies.get("token");

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(
          `${url}?page=${page}&limit=${limit}&search=${search}&sort=${sort}&order=${order}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(res.data.data.data);
        setTotalPages(res.data.data.totalPages);
        setTotalItems(res.data.data.totalItems);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [page, limit, search, sort, order, url, isRefresh, token]);

  useEffect(() => {
    // Cek apakah perangkat adalah mobile
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Infinite scroll handler
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 50 && page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="grid gap-5 lg:gap-7.5">
      <div className="card card-grid min-w-full">
        <div className="card-header flex justify-between items-center gap-2">
          {/* View Mode Selector */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">View:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="select select-sm"
            >
              <option value="table">Table</option>
              <option value="grid">Grid</option>
              <option value="card">Card</option>
            </select>
          </div>
        </div>

        <div className="card-body">
          {isMobile ? (
            <div
              className="overflow-auto max-h-[500px]"
              onScroll={handleScroll}
            >
              {viewMode === "table" && (
                <table className="table table-auto">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="border p-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="border p-2">
                              {flexRender(
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
          ) : (
            <>
              {viewMode === "table" && (
                <table className="table table-auto">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th key={header.id} className="border p-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <td key={cell.id} className="border p-2">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {viewMode === "grid" && (
                <div className="grid grid-cols-3 gap-4">
                  {data.map((item, index) => (
                    <div key={index} className="border p-4 rounded-lg">
                      <h3 className="font-bold">Item {index + 1}</h3>
                      <p>{JSON.stringify(item)}</p>
                    </div>
                  ))}
                </div>
              )}
              {viewMode === "card" && (
                <div className="flex flex-wrap gap-4">
                  {data.map((item, index) => (
                    <div
                      key={index}
                      className="border p-4 rounded-lg shadow-md"
                    >
                      <h3 className="font-bold">Card {index + 1}</h3>
                      <p>{JSON.stringify(item)}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataTable;

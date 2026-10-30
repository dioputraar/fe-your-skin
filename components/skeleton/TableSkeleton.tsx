import React from "react";
import { Skeleton } from "@heroui/react";

interface TableSkeletonProps {
  columns?: number;
  limit?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ columns = 6, limit = 10 }) => {
  const colCount = columns > 6 ? 6 : columns;
  
  return (
    <table className="table w-full">
      <thead className="mb-2">
        <tr>
          {Array.from({ length: colCount }).map((_, colIndex) => (
            <th key={colIndex} className="px-2 py-2">
              <Skeleton className="rounded-lg">
                <div className="h-8 w-full rounded-lg bg-default-200"></div>
              </Skeleton>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: limit }).map((_, rowIndex) => (
          <tr key={rowIndex} className="text-sm font-normal">
            {Array.from({ length: colCount }).map((_, colIndex) => {
              // Gunakan modulo untuk menghindari hydration mismatch dari Math.random()
              const isShort = (rowIndex + colIndex) % 3 === 0;
              return (
                <td key={colIndex} className="px-2 py-2">
                  <Skeleton className={`rounded-lg ${isShort ? "w-1/2" : "w-full"}`}>
                    <div className="h-5 w-full rounded-lg bg-default-200"></div>
                  </Skeleton>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableSkeleton;

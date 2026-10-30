import React from "react";

const TableSkeleton = ({ columns = 6, limit = 10 }) => {
  columns > 6 ? (columns = 6) : (columns = columns);
  return (
    <table className="table w-full">
      <thead className="mb-2">
        <tr>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <th key={colIndex} className="px-2 py-1 ">
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: limit }).map((_, rowIndex) => (
          <tr key={rowIndex} className="text-sm font-normal">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <td key={colIndex} className="px-2 py-1">
                <div
                  className={`h-5 bg-gray-200 rounded w-[${
                    Math.random() > 0.5 ? "50%" : "100%"
                  }] animate-pulse`}
                ></div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableSkeleton;

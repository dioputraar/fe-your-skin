const GridSkeleton = ({ column = 8, limit = 10 }) => {
  column > 8 ? (column = 8) : (column = column);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {Array.from({ length: limit }).map((_, index) => (
        <div className="card shadow bg-gray-100 animate-pulse" key={index}>
          <div className="card-body">
            <div className="m-4">
              {Array.from({ length: column }).map((_, col) => (
                <div className="grid grid-cols-5 gap-2 mb-2" key={col}>
                  <div className={`col-start-1 col-end-${Math.random() < 0.5 ? 2 : 3} h-5 bg-gray-200 rounded animate-pulse`}></div>
                  <div className={`col-start-3 col-end-${Math.random() < 0.5 ? 5 : 6} h-5 bg-gray-200 rounded animate-pulse`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GridSkeleton;

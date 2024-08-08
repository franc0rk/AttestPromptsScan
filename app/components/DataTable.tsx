import React from "react";

// Define the props type
interface DataTableProps {
  data: any[];
  columns: any[];
}

const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const rowsPerPage = 5;
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <div className="data-table bg-gray-900 text-white rounded-lg overflow-hidden shadow-lg slide-in">
      <section className="p-4 bg-gray-800 flex justify-between items-center">
        <ul className="flex space-x-4 text-sm">
          <li className="cursor-pointer hover:text-gray-400">
            <i className="settings">⚙️</i> Customize columns
          </li>
          <li className="cursor-pointer hover:text-gray-400">
            <i className="filters">🔍</i>Filters
          </li>
        </ul>
      </section>
      <section className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white bg-black text-xs">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-2 py-1 border border-white rounded-tl-lg">
                Hash
              </th>
              <th className="px-2 py-1 border border-white">Method</th>
              <th className="px-2 py-1 border border-white">Age</th>
              <th className="px-2 py-1 border border-white">From</th>
              <th className="px-2 py-1 border border-white">To</th>
              <th className="px-2 py-1 border border-white">Amount</th>
              <th className="px-2 py-1 border border-white rounded-tr-lg">
                Fee
              </th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, rowsPerPage).map((row, index) => (
              <tr key={index}>
                <td className="px-2 py-1 border border-white">
                  {row.hash.slice(0, 9)}...
                </td>
                <td className="px-2 py-1 border border-white">{row.method}</td>
                <td className="px-2 py-1 border border-white">
                  {row.timestamp}
                </td>
                <td className="px-2 py-1 border border-white text-xs">
                  {row.from.hash.slice(0, 9)}{" "}
                  <span className="ml-2 font-bold border p-1 text-xs rounded-md">
                    OUT
                  </span>
                </td>
                <td className="px-2 py-1 border border-white">
                  {row.to.hash.slice(0, 9)}
                </td>
                <td className="px-2 py-1 border border-white">
                  {Number(row.value) / 1000000000000000000 || 0} ETH
                </td>
                <td className="px-2 py-1 border border-white">
                  {Number(row.fee.value) / 1000000000000000000 || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="p-4 bg-gray-800 text-sm flex justify-between items-center">
        <span>
          Showing 1-{rowsPerPage} of {data.length} rows
        </span>
        <div className="flex space-x-2 items-center">
          <button className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600">
            Previous
          </button>
          <span>Page 1 of {totalPages}</span>
          <button className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600">
            Next
          </button>
        </div>
      </section>
    </div>
  );
};

export default DataTable;

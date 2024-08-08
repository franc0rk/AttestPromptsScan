import React from "react";

interface HistoryListProps {
  history: any[];
}

const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  return (
    <ul>
      {history.map((item) => (
        <li>
          <div className="p-1 border-b hover:bg-gray-900 cursor-pointer">
            <h4 className="text-xs">
              {item.prompt.slice(0, 32)} {item.prompt.length > 32 && "..."}
            </h4>
            <div className="flex flex-wrap">
              {item.tags.map((tag: any) => (
                <div className="text-xs px-2 py-1 rounded-md text-white font-bold bg-gray-900">
                  {tag}
                </div>
              ))}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default HistoryList;

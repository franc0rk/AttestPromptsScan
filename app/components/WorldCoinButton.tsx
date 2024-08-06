import React from "react";

interface WorldCoinButtonProps {
  connected: (address: string) => void;
}

const WorldCoinButton: React.FC<WorldCoinButtonProps> = ({ connected }) => {
  async function getWorldId() {
    connected("address");
  }

  return (
    <button
      onClick={getWorldId}
      className="px-4 py-2 border-2 rounded-md mb-4 text-xs h-12 font-bold"
    >
      <div className="flex items-center">
        <div className="ml-2">
          <img width={20} height={20} src="/worldcoin.png" alt="worldcoin" />
        </div>
        <div className="ml-6">
          Sign in
          <br />
          with Worldcoin
        </div>
      </div>
    </button>
  );
};

export default WorldCoinButton;

"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import TypingEffect from "./components/TypingEffect";
import DataTable from "./components/DataTable";
import { ethers } from "ethers";
import WorldCoinButton from "./components/WorldCoinButton";

export default function Home() {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [responseData, setResponseData] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<
    { message: string; sent?: boolean }[]
  >([]);

  const [currentMessage, setCurrentMessage] = useState<string>("");
  const [currentAnswer, setCurrentAnswer] = useState<string>("");
  const [content, setContent] = useState<{ key: string; component: string }[]>(
    []
  );

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMessage();
    fetchTransactionData();
  };

  function addMessage() {
    setChatMessages([...chatMessages, { message: currentMessage, sent: true }]);
    setCurrentMessage("");
  }

  async function fetchTransactionData() {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/llm");
      const jsonString = response.data.data.replace(/```json|```/g, "").trim();

      const parsedData = JSON.parse(jsonString);
      setContent(parsedData.content);
      setCurrentAnswer(parsedData.message);

      if (Array.isArray(parsedData.url)) {
        await Promise.all(
          parsedData.url.map(async (url: string) => {
            try {
              const res = await axios.get(url);
              setResponseData(res.data);
            } catch (error) {
              console.error("Error fetching or processing data:", error);
              setError("An error occurred while processing data.");
            }
          })
        );
      } else {
        console.error("Invalid URL format in JSON.");
        setError("Invalid URL format in JSON.");
      }
    } catch (error) {
      console.error("Error fetching data from /api:", error);
      setError("Failed to fetch data from the API.");
    } finally {
      setLoading(false);
    }
  }

  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("Base");

  async function connectWallet() {
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    setAddress(address);
  }

  return (
    <div className="flex flex-wrap h-screen">
      <aside className="w-1/6 border-r h-full p-4">
        <section>
          <div className="flex justify-center">
            <Image src="/logo.png" alt="Logo" width={100} height={100} />
          </div>
        </section>
        <section className="flex flex-col">
          {address ? (
            <button
              onClick={() => setAddress("")}
              className="px-4 py-2 border-2 rounded-md mb-4 text-xs h-12 font-bold"
            >
              Disconnect
              <br />
              <small className="font-xs">{address.slice(0, 9)}...</small>
            </button>
          ) : (
            <button
              onClick={connectWallet}
              className="px-4 py-2 border-2 rounded-md mb-4 text-xs h-12 font-bold"
            >
              Connect Wallet
            </button>
          )}
          {!address && <WorldCoinButton connected={(e) => setAddress(e)} />}
        </section>
        <section className="flex flex-col">
          <label htmlFor="network-select">Select Network:</label>
          <select
            id="network-select"
            className="rounded-full py-1 bg-transparent border-2 px-4 mb-4"
            onChange={(e) => setNetwork(e.target.value)}
          >
            <option className="bg-black text-white" value="Base">
              Base
            </option>
            <option className="bg-black text-white" value="Optimism">
              Optimism
            </option>
            <option className="bg-black text-white" value="Ethereum">
              Ethereum (mainnet)
            </option>
          </select>
          <div className="relative">
            Dev Mode <input type="checkbox" />
          </div>
        </section>
        <section>History</section>
      </aside>
      <article className="w-5/6 p-4 h-full">
        <header className="px-6 py-2 border rounded-md">
          <section className="network">
            <div className="text-center mt-1">
              You are at chain: <span></span>
              {network === "Base" && (
                <span className="bg-blue-500 px-2 py-1 rounded-md font-bold">
                  Base
                </span>
              )}
              {network === "Optimism" && (
                <span className="bg-red-500 px-2 py-1 rounded-md font-bold">
                  Optimism
                </span>
              )}
              {network === "Ethereum" && (
                <span className="bg-purple-500 px-2 py-1 rounded-md font-bold">
                  Ethereum (mainnet)
                </span>
              )}
            </div>
          </section>
          <section className="data">
            <span>ETH Price: $2800</span> - <span>Gas Fee: 2000</span>
          </section>
        </header>
        <main>
          <div className="w-full h-full  mx-auto">
            <div className="flex flex-col w-full h-full">
              <section
                ref={messagesContainerRef}
                className="flex flex-col messages"
              >
                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`border rounded-md px-3 py-1 my-1 max-w-48 ${
                      msg.sent ? "self-end mr-2" : "self-start ml-2"
                    }`}
                  >
                    {msg.message}
                  </div>
                ))}
                <div className="my-8">
                  <TypingEffect text={currentAnswer} speed={50} />
                  <br />
                  {loading && (
                    <div className="animate-blink w-8 h-8 bg-white mt-8"></div>
                  )}
                  {content.map((section) => (
                    <div>
                      {responseData.items && section.component === "table" && (
                        <DataTable
                          data={responseData.items}
                          columns={[]}
                          key={section.key}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </section>
              <section className="mt-auto mb-4">
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <input
                      className="rounded-md w-full p-2 bg-transparent border-2 border-white"
                      placeholder="Type your message"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                    />
                    <button
                      className="absolute bottom-2 right-2 border rounded-md p-1 text-xs"
                      type="submit"
                    >
                      &gt;
                    </button>
                  </div>
                </form>
              </section>
            </div>
          </div>
        </main>
      </article>
    </div>
  );
}

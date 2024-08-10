"use client";

import axios from "axios";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import TypingEffect from "./components/TypingEffect";
import DataTable from "./components/DataTable";
import { ethers } from "ethers";
import WorldCoinButton from "./components/WorldCoinButton";
import { attest } from "./services/eas";
import { getAllPromptsBySchema, getHistory } from "./services/history";
import HistoryList from "./components/HistoryList";
import {
  FaArrowUp,
  FaClipboard,
  FaClock,
  FaCopy,
  FaCube,
  FaEthereum,
  FaExchangeAlt,
  FaGasPump,
  FaGlobe,
  FaThumbsDown,
  FaThumbsUp,
  FaTools,
  FaWallet,
} from "react-icons/fa";
import {
  FaArrowTrendUp,
  FaArrowUp19,
  FaArrowUp91,
  FaArrowUpRightDots,
  FaMessage,
} from "react-icons/fa6";
import TagsSection from "./components/TagsSection";

export default function Home() {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [responseData, setResponseData] = useState<any>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  interface IMessage {
    message: string;
    sent?: boolean;
    attestation?: string;
    content?: any[];
    data?: any;
  }
  const [chatMessages, setChatMessages] = useState<IMessage[]>([]);

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
  }, [chatMessages, responseData]);

  const handleSubmit = (e?: React.FormEvent) => {
    e && e.preventDefault();
    setShowCards(false);
    addMessage();
    fetchTransactionData(currentMessage);
  };

  function addMessage() {
    if (currentAnswer) {
      setChatMessages([
        ...chatMessages,
        { message: currentAnswer, sent: false, content, data: responseData },
      ]);
      console.log(currentAnswer, content);
    }
    setChatMessages((prev) => [
      ...prev,
      { message: currentMessage, sent: true },
    ]);
    setCurrentMessage("");
    setContent([]);
    setResponseData("");
    setCurrentAnswer("");
  }

  async function fetchTransactionData(_msg: string) {
    setLoading(true);

    setError(null);

    try {
      const response = await axios.post("/api/llm", {
        message: _msg,
        params: { network, address },
      });
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

  const [signer, setSigner] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [network, setNetwork] = useState("Optimism-Sepolia");

  async function connectWallet() {
    // @ts-ignore
    const provider = new ethers.BrowserProvider(window.ethereum);
    const _signer = await provider.getSigner();
    const address = await _signer.getAddress();

    setSigner(_signer);
    setAddress(address);
  }

  async function attestPrompt(msg: any, msgIndex: number) {
    const { attestationUid } = await attest(signer, {
      prompt: msg.message,
      tags: ["#transactions"],
    });
    setChatMessages((messages) => {
      return messages.map((m: any, i: number) => ({
        ...m,
        attestation: i === msgIndex && attestationUid,
      }));
    });
  }

  const [history, setHistory] = useState<any>([]);

  async function fetchHistory() {
    const hist = await getHistory(signer);
    setHistory(hist);
  }

  function selectTrendPrompt(msg: string) {
    setMode("chat");
    setShowCards(false);
    setCurrentMessage(msg);
    setChatMessages([...chatMessages, { message: msg, sent: true }]);
    setCurrentMessage("");
    fetchTransactionData(msg);
  }

  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    if (signer) {
      setShowCards(true);
      fetchHistory();
      fetchAllPrompts();
    }
  }, [signer]);

  const [allPrompts, setAllPrompts] = useState<any[]>([]);

  async function fetchAllPrompts() {
    const prompts = await getAllPromptsBySchema(signer);
    setAllPrompts(prompts);
  }

  const [mode, setMode] = useState<"chat" | "social">("chat");

  const LABELS: any = { "transactions-table": "Transactions" };

  const [openedMessages, setOpenedMessages] = useState<any>({});

  function openMessage(msgIndex: number, sectionIndex: number): void {
    setOpenedMessages((prev: any) => ({
      ...prev,
      [`${msgIndex}-${sectionIndex}`]: !prev[`${msgIndex}-${sectionIndex}`],
    }));
  }
  function openedMessage(msgIndex: number, sectionIndex: number): boolean {
    return openedMessages[`${msgIndex}-${sectionIndex}`];
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
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
          >
            <option className="bg-black text-white" value="Ethereum">
              Ethereum (mainnet)
            </option>
            <option className="bg-black text-white" value="Base">
              Base
            </option>
            <option className="bg-black text-white" value="Optimism">
              Optimism
            </option>
            <option className="bg-black text-white" value="Optimism-Sepolia">
              Optimism-Sepolia (testnet)
            </option>
          </select>
          <div className="relative mb-4">
            Dev Mode <input type="checkbox" />
          </div>
        </section>
        {address && (
          <section>
            <h4 className="mb-4">History</h4>
            <HistoryList history={history} />
          </section>
        )}
      </aside>
      <article className="w-5/6 p-4 h-full">
        <header className="px-6 py-2 border rounded-md">
          <div className="flex items-center">
            <div className="flex-1">
              <section className="network mb-2">
                <div className="mt-1">
                  You are at chain: <span></span>
                  {network === "Base" && (
                    <span className="bg-blue-500 px-2 py-1 rounded-md font-bold">
                      Base
                    </span>
                  )}
                  {network.includes("Optimism") && (
                    <span className="bg-red-500 px-2 py-1 rounded-md font-bold">
                      {network}
                    </span>
                  )}
                  {network === "Ethereum" && (
                    <span className="bg-purple-500 px-2 py-1 rounded-md font-bold">
                      Ethereum (mainnet)
                    </span>
                  )}
                </div>
              </section>
              <section className="data flex">
                <div className="flex items-center mr-2">
                  <FaEthereum className="mr-2" /> ETH Price: $2800.21
                </div>
                <div className="flex items-center">
                  <FaGasPump className="mr-2" /> Gas Tracker: $0.17
                </div>
              </section>
            </div>
            <div className="">
              <div className="grid grid-cols-4 h-full w-full border rounded">
                {/* Grid Item 1 */}
                <div className="flex flex-col items-center justify-center p-2 border border-gray-200">
                  <FaCube />
                  <span className="mt-1 text-xs font-bold text-white">
                    Total Blocks
                  </span>
                  <div className="text-xs">3,000,000</div>
                </div>
                {/* Grid Item 2 */}
                <div className="flex flex-col items-center justify-center  p-2 border border-gray-200">
                  <FaExchangeAlt />
                  <span className="mt-1 text-xs font-bold text-white">
                    Total transactions
                  </span>
                  <div className="text-xs">3,000,000</div>
                </div>
                {/* Grid Item 3 */}
                <div className="flex flex-col items-center justify-center p-2 border border-gray-200">
                  <FaClock />
                  <span className="mt-1 text-xs font-bold text-white">
                    Average Block Time
                  </span>
                  <div className="text-xs">2.35s</div>
                </div>
                {/* Grid Item 4 */}
                <div className="flex flex-col items-center justify-center p-2 border border-gray-200">
                  <FaWallet />
                  <span className="mt-1 text-xs font-bold text-white">
                    Wallet addreses
                  </span>
                  <div className="text-xs">3,000,000</div>
                </div>
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="w-full h-full  mx-auto">
            <div className="flex flex-col w-full h-full">
              {mode === "chat" && (
                <section
                  ref={messagesContainerRef}
                  className="flex flex-col messages"
                >
                  {chatMessages.map((msg, msgIndex) => (
                    <div
                      key={msgIndex}
                      className={`text-lg border-2 rounded-md px-3 py-2 my-2   ${
                        msg.sent
                          ? "self-end mr-2 "
                          : "self-start ml-2 border-gray-600"
                      }`}
                    >
                      {!msg.sent && (
                        <div className="text-xs font-bold">ChatScout:</div>
                      )}{" "}
                      <span className="text-sm">{msg.message}</span>
                      {msg.content && (
                        <div>
                          {msg.content?.map(
                            (section: any, sectionIndex: number) => (
                              <div
                                className="text-sm font-bold my-1"
                                key={sectionIndex}
                              >
                                <button
                                  onClick={() =>
                                    openMessage(msgIndex, sectionIndex)
                                  }
                                >
                                  &gt; {LABELS[section.key]}
                                </button>
                                {openedMessage(msgIndex, sectionIndex) && (
                                  <div>
                                    {msg.data?.items &&
                                      section.component === "table" && (
                                        <DataTable
                                          animated={false}
                                          data={msg.data.items}
                                          columns={[]}
                                          key={section.key}
                                        />
                                      )}
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      )}
                      {address && msg.sent && (
                        <div>
                          {msg.attestation ? (
                            <a
                              href={`https://optimism-sepolia.easscan.org/attestation/view/${msg.attestation}`}
                              className="text-xs font-bold px-2 py-1 border rounded-md"
                            >
                              View
                            </a>
                          ) : (
                            <button
                              onClick={() => attestPrompt(msg, msgIndex)}
                              className="text-xs font-bold px-2 py-1 border rounded-md"
                            >
                              Attest
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="my-8">
                    <TypingEffect text={currentAnswer} speed={50} />
                    <br />
                    {loading && (
                      <div className="animate-blink w-4 h-4 bg-white my-8"></div>
                    )}
                    {content.map((section) => (
                      <div>
                        {responseData.items &&
                          section.component === "table" && (
                            <DataTable
                              data={responseData.items}
                              columns={[]}
                              key={section.key}
                              animated={true}
                            />
                          )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
              {mode === "social" && (
                <section className="flex flex-col m-4 border-2 rounded-md">
                  <h2 className="text-2xl font-bold p-4">ChatScout - Social</h2>
                  <div className="p-4">
                    <input
                      className="w-full bg-transparent border-2 px-2 py-1 rounded-md"
                      placeholder="Search prompts"
                    />
                    <TagsSection />
                    {allPrompts.length == 0 && (
                      <div>Connect your wallet to start seeing prompts.</div>
                    )}
                  </div>
                  {allPrompts.map((p) => (
                    <div className="py-4 px-8 border-b h-full">
                      <div>{p.attester}:</div>
                      <div className="flex items-center py-4">
                        {p.prompt}{" "}
                        <button>
                          <FaCopy />
                        </button>
                      </div>
                      <div className="flex">
                        <button className="border px-2 py-1 rounded-md flex items-center mr-2">
                          <FaThumbsUp /> {0}
                        </button>
                        <button className="border px-2 py-1 rounded-md flex items-center mr-2">
                          <FaThumbsDown /> {0}
                        </button>
                        <button
                          onClick={() => selectTrendPrompt(p.prompt)}
                          className="text-xs font-bold border px-2 py-1 rounded-md flex items-center mr-2"
                        >
                          Try!
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              <section className="mt-auto mb-4">
                {mode === "chat" && showCards && (
                  <div className="relative my-2">
                    <div className="w-full h-96">
                      <div className="flex flex-wrap h-full">
                        <div className="w-1/3 p-8">
                          <div className="p-4 border rounded-md h-full">
                            <section>
                              <h2 className="font-bold mb-1">
                                <div className="flex items-center">
                                  <FaArrowTrendUp className="mr-2" />
                                  Trend
                                </div>
                              </h2>
                              <p className="text-xs">Query trend prompts.</p>
                            </section>
                            <div className="max-w-full overflow-x-auto">
                              <TagsSection />
                            </div>
                            <section>
                              <div className="flex flex-col px-4">
                                {allPrompts.slice(0, 3).map((p) => (
                                  <div
                                    className="border rounded-md px-2 py-1 mb-2 cursor-pointer hover:bg-white hover:text-black"
                                    onClick={() => selectTrendPrompt(p.prompt)}
                                  >
                                    {p.prompt}
                                  </div>
                                ))}
                              </div>
                            </section>
                          </div>
                        </div>
                        <div className="w-1/3 p-8">
                          <div className="p-4 border rounded-md h-full">
                            <section>
                              <h2 className="font-bold mb-1">
                                <div className="flex items-center">
                                  <FaGlobe className="mr-2" />
                                  Social
                                </div>
                              </h2>
                              <p className="text-xs">
                                Explore around many prompts.
                              </p>
                            </section>
                            <section>
                              <div className="w-52 h-52 mx-auto">
                                <img
                                  className="w-full h-full"
                                  src="/socialimg.png"
                                />
                              </div>
                            </section>
                            <section>
                              <div className="flex justify-center">
                                <button
                                  onClick={() => setMode("social")}
                                  className="border-2 font-bold px-8 py-2 rounded-md"
                                >
                                  Explore
                                </button>
                              </div>
                            </section>
                          </div>
                        </div>
                        <div className="w-1/3 p-8">
                          <div className="p-4 border rounded-md h-full">
                            <section>
                              <div className="flex items-center">
                                <FaTools className="mr-2" />
                                Fix
                              </div>
                              <p className="text-xs">
                                Fix prompts and get rewards.
                              </p>
                            </section>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <div className="absolute left-2 top-2">
                      <button
                        type="button"
                        className="flex items-center px-4 py-1 border rounded-full text-xs font-bold hover:bg-white hover:text-black"
                        onClick={() =>
                          setMode(mode === "social" ? "chat" : "social")
                        }
                      >
                        {mode === "social" ? (
                          <FaMessage className="mr-1" />
                        ) : (
                          <FaGlobe className="mr-1" />
                        )}
                        {mode === "social" ? "Chat" : "Social"}
                      </button>
                    </div>
                    <input
                      className="rounded-md w-full p-2 pl-28 bg-transparent border-2 border-white"
                      placeholder="Type your message"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                    />
                    <button
                      className="absolute bottom-2 right-2 border-2 font-bold rounded-md p-1 text-xs"
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

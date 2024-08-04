"use client";

import axios from "axios";
import { useState } from "react";

export default function Home() {
  const [data, setData] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  async function fetchTransactionData() {
    setIsLoading(true);
    setFetchError(null);

    try {
      const response = await axios.get("/api");
      const jsonString = response.data.data.replace(/```json|```/g, "").trim();

      const parsedData = JSON.parse(jsonString);

      if (Array.isArray(parsedData.url)) {
        await Promise.all(
          parsedData.url.map(async (url: string) => {
            try {
              const res = await axios.get(url);
              setData(res.data);
            } catch (error) {
              console.error("Error fetching or processing data:", error);
              setFetchError("An error occurred while processing data.");
            }
          })
        );
      } else {
        console.error("Invalid URL format in JSON.");
        setFetchError("Invalid URL format in JSON.");
      }
    } catch (error) {
      console.error("Error fetching data from /api:", error);
      setFetchError("Failed to fetch data from the API.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1>Transactions</h1>
      <button
        className="bg-blue-500 px-4 py-2 rounded-md"
        onClick={fetchTransactionData}
      >
        Fetch Data
      </button>
      <div>
        {isLoading && "Loading..."}
        {fetchError && <p>{fetchError}</p>}
        {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      </div>
    </div>
  );
}

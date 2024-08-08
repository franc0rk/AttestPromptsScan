import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Use ES6 import syntax

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log(body);

    // Initialize the API key and generative model
    // @ts-ignore
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        "Act as a frontend developer expert in consuming APIs. Read the following REST API documentation and process the prompts given to you so that you provide the URL of the endpoint(s) in a JSON format like this {url: [url that you think is the right one to query]} (or an array of them). Additionally, include a message, which will be the answer to the user, and also add a key named content where you provide an array of objects like this [{key: 'transactions-table', component: 'table'}]. This array depends on the query the user is asking for. The API URL is https://[network].blockscout.com/api/v2/, where [network] can be one of these options: base, eth, optimism. If [network] is not specified, set eth as default. We will be working with one endpoint for now: GET - addresses/{address_hash}/transactions - get address txs.",
    });

    const prompt = `${body.message}${JSON.stringify(body.params)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text(); // Await the text() method

    return NextResponse.json({ data: text });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process the request." },
      { status: 500 }
    );
  }
}

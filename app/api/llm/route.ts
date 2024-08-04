export async function POST() {
  const { GoogleGenerativeAI } = require("@google/generative-ai");

  // Access your API key as an environment variable (see "Set up your API key" above)
  const genAI = new GoogleGenerativeAI(process.env.API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction:
      "act as a frontend developer expert in consuming apis, you have to read the following REST API documentation and being able to process the prompts given to you so that in the end you provide the url of the endpoint or endpoints in a json format like this {url: [url that you think its the right one to query]} (or an array of them), aditionally to json object response you have to add a message, which will be the answer to the user, and also add a key named content where you should provide an array of with objects like this [{key: 'transactions-table', component: 'table'}], this array depends on the query that the user is asking for, to query for getting the result that the user wants as it would do in platforms like etherscan\n\nthe api url is this: https://[network].blockscout.com/api/v2/, notice that network can be one of these options: base, eth, optimism, if [network] is not specified set eth as default\n\nwe will be working just with one endpoint for the moment\n\nGET - addresses/{address_hash}/transactions - get address txs",
  });

  const prompt =
    "i wanna see my latest transactions, {network: base}, {address: '0xa0f79412dcbeb6d9d1c2a49489c73995ab8f478f'}";

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return Response.json({ data: text });
}

import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://optimism-sepolia.easscan.org/graphql", // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});

function getQuery(address: string) {
  return gql`
    query Attestations {
      attestations(
        where: {
          attester: { equals: "${address}" }
        }
        take: 25
        orderBy: { time: desc }
      ) {
        id
        attester
        recipient
        refUID
        revocable
        revocationTime
        expirationTime
        data
      }
    }
  `;
}

// This function calls the historical attestation prompts through a query to the GraphQL API
export async function getHistory(signer: any) {
  const address = await signer.getAddress();

  const { data } = await client.query({
    query: getQuery(address),
  });

  console.log(data.attestations);
  console.log(data, "data");

  const easContractAddress = "0x4200000000000000000000000000000000000021";
  const schemaUID =
    "0xb67d5737d85d4f24fd2e6f5fdb8758d0c95c6145d00e7eaad6aaf599adde68d3";
  const eas = new EAS(easContractAddress);
  const schemaEncoder = new SchemaEncoder("string prompt,string[] tags");

  // Signer must be an ethers-like signer.
  await eas.connect(signer);

  const history: any[] = [];

  // Use Promise.all to handle multiple asynchronous calls
  await Promise.all(
    data.attestations.map(async (attestation: any) => {
      const a = await eas.getAttestation(attestation.id);
      history.push(schemaEncoder.decodeData(a.data));
    })
  );

  // Transform the history array to the desired format
  const transformedHistory = history.map((item: any) => {
    const promptField = item.find((field: any) => field.name === "prompt");
    const tagsField = item.find((field: any) => field.name === "tags");

    // Extract values and handle proxy objects if necessary
    const prompt = promptField ? promptField.value.value : "";
    const tags = tagsField
      ? Array.isArray(tagsField.value.value)
        ? tagsField.value.value
        : []
      : [];

    return {
      prompt,
      tags,
    };
  });

  console.log(transformedHistory);

  return transformedHistory;
}

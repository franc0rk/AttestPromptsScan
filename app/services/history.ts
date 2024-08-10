import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ApolloClient, gql, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
  uri: "https://optimism-sepolia.easscan.org/graphql", // Replace with your GraphQL endpoint
  cache: new InMemoryCache(),
});

const schemaUID =
  "0xb67d5737d85d4f24fd2e6f5fdb8758d0c95c6145d00e7eaad6aaf599adde68d3";

function getQuery(address: string) {
  return gql`
    query Attestations {
      attestations(
        where: {
          attester: { equals: "${address}" }
          schemaId: {
            equals: "${schemaUID}"
          }
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

function getAllQuery() {
  return gql`
    query Attestations {
      attestations(
        where: {
          schemaId: {
            equals: "${schemaUID}"
          }
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

function getAllLikesQuery() {
  return gql`
    query Attestations {
      attestations(
        where: {
          schemaId: {
            equals: "0x3ac3f0b8d90545ee8179b05e577d489f495c20a2410af9bf8277b4e75e74be7c"
          }
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

  const easContractAddress = "0x4200000000000000000000000000000000000021";
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

  return transformedHistory;
}

export async function getAllPromptsBySchema(signer: any) {
  // const address = await signer.getAddress();

  const { data } = await client.query({
    query: getAllQuery(),
  });

  const easContractAddress = "0x4200000000000000000000000000000000000021";
  const eas = new EAS(easContractAddress);
  const schemaEncoder = new SchemaEncoder("string prompt,string[] tags");

  // Signer must be an ethers-like signer.
  await eas.connect(signer);

  const history: any[] = [];

  // Use Promise.all to handle multiple asynchronous calls
  await Promise.all(
    data.attestations.map(async (attestation: any) => {
      const a = await eas.getAttestation(attestation.id);
      history.push({
        data: schemaEncoder.decodeData(a.data),
        attester: attestation.attester,
        attestationId: attestation.id,
      });
    })
  );

  // Transform the history array to the desired format
  const transformedHistory = history.map((item: any) => {
    const promptField = item.data.find((field: any) => field.name === "prompt");
    const tagsField = item.data.find((field: any) => field.name === "tags");

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
      attester: item.attester,
      attestationId: item.attestationId,
    };
  });

  return transformedHistory;
}

export async function getAllPromptsByLikeSchema(signer: any) {
  const { data } = await client.query({
    query: getAllLikesQuery(),
  });

  const easContractAddress = "0x4200000000000000000000000000000000000021";
  const eas = new EAS(easContractAddress);
  const schemaEncoder = new SchemaEncoder("string attestationId,string type");

  // Signer must be an ethers-like signer.
  await eas.connect(signer);

  const history: any[] = [];

  // Use Promise.all to handle multiple asynchronous calls
  await Promise.all(
    data.attestations.map(async (attestation: any) => {
      const a = await eas.getAttestation(attestation.id);
      history.push({
        data: schemaEncoder.decodeData(a.data),
        attester: attestation.attester,
        attestation: attestation.id,
      });
    })
  );

  // Transform the history array to the desired format
  const transformedHistory = history.map((item: any) => {
    const promptField = item.data.find(
      (field: any) => field.name === "attestationId"
    );
    const tagsField = item.data.find((field: any) => field.name === "type");

    // Extract values and handle proxy objects if necessary
    const attestationId = promptField ? promptField.value.value : "";
    const type = tagsField ? tagsField.value.value : "";

    return {
      attestationId,
      type,
      attester: item.attester,
      attestation: item.attestation,
    };
  });

  return transformedHistory;
}

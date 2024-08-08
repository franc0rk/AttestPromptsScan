import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";

export async function attest(signer: any, { prompt, tags }: any) {
  const easContractAddress = "0x4200000000000000000000000000000000000021";
  const schemaUID =
    "0xb67d5737d85d4f24fd2e6f5fdb8758d0c95c6145d00e7eaad6aaf599adde68d3";
  const eas = new EAS(easContractAddress);
  // Signer must be an ethers-like signer.
  await eas.connect(signer);
  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder("string prompt,string[] tags");
  const encodedData = schemaEncoder.encodeData([
    { name: "prompt", value: prompt, type: "string" },
    { name: "tags", value: tags, type: "string[]" },
  ]);
  const tx = await eas.attest({
    schema: schemaUID,
    data: {
      recipient: "0x0000000000000000000000000000000000000000",
      // expirationTime: 0,
      revocable: true, // Be aware that if your schema is not revocable, this MUST be false
      data: encodedData,
    },
  });
  const newAttestationUID = await tx.wait();

  return {
    attestationUid: newAttestationUID,
  };
}

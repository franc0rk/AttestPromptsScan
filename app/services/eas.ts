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

export async function attestLike(signer: any, { attestationId, type }: any) {
  const easContractAddress = "0x4200000000000000000000000000000000000021";
  const schemaUID =
    "0x3ac3f0b8d90545ee8179b05e577d489f495c20a2410af9bf8277b4e75e74be7c";
  const eas = new EAS(easContractAddress);
  // Signer must be an ethers-like signer.
  await eas.connect(signer);
  // Initialize SchemaEncoder with the schema string
  const schemaEncoder = new SchemaEncoder("string attestationId,string type");
  const encodedData = schemaEncoder.encodeData([
    { name: "attestationId", value: attestationId, type: "string" },
    { name: "type", value: type, type: "string" },
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

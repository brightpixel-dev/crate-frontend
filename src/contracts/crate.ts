/**
 * crate.ts
 * ───────────
 * Frontend bindings for the Crate Soroban contract.
 *
 * Contract ID: CA7DGEWWS3VH5J2I4I7FFEB5UHK2MJSYWDKDQKXQM7GDNLI2IRATDTLG
 * Network: Stellar Testnet
 *
 * Each function either:
 *  - Simulates the call (read-only) and returns decoded result, or
 *  - Builds + returns an XDR transaction for the caller to sign & submit
 */

import {
  Contract,
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  nativeToScVal,
  scValToNative,
  Address,
  xdr,
  BASE_FEE,
} from "@stellar/stellar-sdk";

// ─── Config ──────────────────────────────────────────────────────────────────

export const CONTRACT_ID: string =
  (import.meta.env.VITE_CONTRACT_ID as string | undefined)?.trim() ??
  "CA7DGEWWS3VH5J2I4I7FFEB5UHK2MJSYWDKDQKXQM7GDNLI2IRATDTLG";

const NETWORK = (import.meta.env.VITE_NETWORK as string | undefined) ?? "TESTNET";

const RPC_URL =
  NETWORK === "PUBLIC"
    ? "https://soroban-rpc.stellar.org"
    : "https://soroban-testnet.stellar.org";

const NETWORK_PASSPHRASE =
  NETWORK === "PUBLIC"
    ? Networks.PUBLIC
    : Networks.TESTNET;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SampleData {
  id: bigint;
  uploader: string;
  title: string;
  ipfs_cid: string;
  /** Price in stroops */
  price: bigint;
  genre: string;
  bpm: number;
  sales_count: bigint;
  active: boolean;
}

export interface MarketStats {
  totalSamples: bigint;
  totalVolume: bigint;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRpc(): SorobanRpc.Server {
  return new SorobanRpc.Server(RPC_URL, { allowHttp: false });
}

function getContract(): Contract {
  return new Contract(CONTRACT_ID);
}

/**
 * Simulate a read-only contract call and decode the return value.
 */
async function simulateRead<T>(
  sourceAddress: string,
  operation: xdr.Operation
): Promise<T | null> {
  const server = getRpc();
  const source = await server.getAccount(sourceAddress).catch(() => null);
  if (!source) return null;

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  const result = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(result)) {
    console.error("[crate] simulation error:", result.error);
    return null;
  }

  const retval = (result as SorobanRpc.Api.SimulateTransactionSuccessResponse)
    .result?.retval;
  if (!retval) return null;

  return scValToNative(retval) as T;
}

/**
 * Prepare a transaction that requires auth (write operations).
 * Returns the XDR string to be signed by the wallet.
 */
async function buildTransaction(
  sourceAddress: string,
  operation: xdr.Operation
): Promise<string> {
  const server = getRpc();
  const source = await server.getAccount(sourceAddress);

  const tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  // Run simulation to get the auth + resource footprint
  const simResult = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    throw new Error(
      `Transaction simulation failed: ${(simResult as SorobanRpc.Api.SimulateTransactionErrorResponse).error}`
    );
  }

  // Assemble the transaction (attach auth, set resource limits)
  const assembled = SorobanRpc.assembleTransaction(tx, simResult).build();
  return assembled.toXDR();
}

/**
 * Submit a signed transaction XDR and wait for confirmation.
 */
export async function submitTransaction(signedXdr: string): Promise<string> {
  const server = getRpc();
  const { TransactionBuilder: TB } = await import("@stellar/stellar-sdk");
  const tx = TB.fromXDR(signedXdr, NETWORK_PASSPHRASE);
  const sendResult = await server.sendTransaction(tx);

  if (sendResult.status === "ERROR") {
    throw new Error(`Submit failed: ${JSON.stringify(sendResult.errorResult)}`);
  }

  // Poll for result
  let getResult = await server.getTransaction(sendResult.hash);
  let attempts = 0;
  while (
    getResult.status === SorobanRpc.Api.GetTransactionStatus.NOT_FOUND &&
    attempts < 30
  ) {
    await new Promise((r) => setTimeout(r, 1000));
    getResult = await server.getTransaction(sendResult.hash);
    attempts++;
  }

  if (getResult.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
    return sendResult.hash;
  }

  throw new Error(`Transaction failed with status: ${getResult.status}`);
}

// ─── Contract Functions ───────────────────────────────────────────────────────

/**
 * Upload a sample to the marketplace.
 * Returns the XDR of the prepared transaction (caller must sign).
 */
export async function uploadSample(params: {
  uploader: string;
  title: string;
  ipfsCid: string;
  priceXlm: number;
  genre: string;
  bpm: number;
}): Promise<string> {
  const contract = getContract();
  const op = contract.call(
    "upload_sample",
    new Address(params.uploader).toScVal(),
    nativeToScVal(params.title, { type: "string" }),
    nativeToScVal(params.ipfsCid, { type: "string" }),
    nativeToScVal(BigInt(params.priceXlm), { type: "i128" }),
    nativeToScVal(params.genre, { type: "string" }),
    nativeToScVal(params.bpm, { type: "u32" })
  );
  return buildTransaction(params.uploader, op);
}

/**
 * Purchase a sample. Returns signed XDR for submission.
 */
export async function purchaseSample(params: {
  buyer: string;
  sampleId: bigint;
}): Promise<string> {
  const contract = getContract();
  const op = contract.call(
    "purchase_sample",
    new Address(params.buyer).toScVal(),
    nativeToScVal(params.sampleId, { type: "u64" })
  );
  return buildTransaction(params.buyer, op);
}

/**
 * Withdraw producer earnings. Returns XDR for signing.
 */
export async function withdrawEarnings(producer: string): Promise<string> {
  const contract = getContract();
  const op = contract.call(
    "withdraw_earnings",
    new Address(producer).toScVal()
  );
  return buildTransaction(producer, op);
}

/**
 * Read a sample by ID.
 */
export async function getSample(
  sourceAddress: string,
  sampleId: bigint
): Promise<SampleData | null> {
  const contract = getContract();
  const op = contract.call(
    "get_sample",
    nativeToScVal(sampleId, { type: "u64" })
  );
  const raw = await simulateRead<Record<string, unknown>>(sourceAddress, op);
  if (!raw) return null;

  return {
    id: raw.id as bigint,
    uploader: raw.uploader as string,
    title: raw.title as string,
    ipfs_cid: raw.ipfs_cid as string,
    price: raw.price as bigint,
    genre: raw.genre as string,
    bpm: raw.bpm as number,
    sales_count: raw.sales_count as bigint,
    active: raw.active as boolean,
  };
}

/**
 * Get producer earnings (in stroops).
 */
export async function getEarnings(
  sourceAddress: string,
  producerAddress: string
): Promise<bigint> {
  const contract = getContract();
  const op = contract.call(
    "get_earnings",
    new Address(producerAddress).toScVal()
  );
  const result = await simulateRead<bigint>(sourceAddress, op);
  return result ?? 0n;
}

/**
 * Get global marketplace stats.
 */
export async function getStats(
  sourceAddress: string
): Promise<MarketStats | null> {
  const contract = getContract();
  const op = contract.call("get_stats");
  const result = await simulateRead<[bigint, bigint]>(sourceAddress, op);
  if (!result) return null;
  return {
    totalSamples: result[0],
    totalVolume: result[1],
  };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

/** Convert stroops to XLM display string */
export function stroopsToXlm(stroops: bigint): string {
  const xlm = Number(stroops) / 10_000_000;
  return xlm.toFixed(2);
}

/** Convert XLM to stroops */
export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * 10_000_000));
}

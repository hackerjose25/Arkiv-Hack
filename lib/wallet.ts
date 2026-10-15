"use client";
import {
  createWalletClient,
  ExpirationTime,
  type CreateEntityParameters,
} from "@arkiv-network/sdk";
import { tiramisu } from "@arkiv-network/sdk/chains";
import { i32 } from "@arkiv-network/sdk/attr";
import { custom, isAddress, type EIP1193Provider } from "viem";
import { publicClient } from "./arkiv";
import { encodeDashboard, type Dashboard } from "./dashboard";
declare global {
  interface Window {
    ethereum?: EIP1193Provider;
  }
}
export async function connectWallet() {
  const provider = window.ethereum;
  if (!provider)
    throw new Error(
      "Install an EIP-1193 wallet such as MetaMask to publish. Reading needs no wallet.",
    );
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const account = accounts[0];
  if (!account || !isAddress(account))
    throw new Error("Select a valid wallet account");
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x7614d1" }],
    });
  } catch (e) {
    if (typeof e !== "object" || !e || !("code" in e) || e.code !== 4902)
      throw e;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x7614d1",
          chainName: "Arkiv Tiramisu",
          nativeCurrency: tiramisu.nativeCurrency,
          rpcUrls: [tiramisu.rpcUrls.default.http[0]],
          blockExplorerUrls: ["https://tiramisu.explorer.arkiv.network"],
        },
      ],
    });
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x7614d1" }],
    });
  }
  if ((await provider.request({ method: "eth_chainId" })) !== "0x7614d1")
    throw new Error("Switch to Tiramisu");
  if (
    (await provider.request({ method: "eth_accounts" }))[0]?.toLowerCase() !==
    account.toLowerCase()
  )
    throw new Error("Account changed. Reconnect.");
  return { account, provider };
}
// Journal persists before send admission. Uncertain sends must be reconciled, never auto-retried.
export async function publishDashboard(spec: Dashboard) {
  const publicId = crypto.randomUUID();
  const [result] = await writeEntities(
    [
      {
        payload: encodeDashboard(spec),
        contentType: "application/json",
        attributes: {
          app: "arkivsight",
          kind: "dashboard",
          schema_version: i32(1),
          public_id: publicId,
        },
        expires: ExpirationTime.fromDays(90),
        flags: { readonly: true, permissionlessExtension: false },
      },
    ],
    "dashboard",
  );
  return result;
}
async function writeEntities(
  parameters: CreateEntityParameters[],
  kind: string,
) {
  if (!navigator.locks)
    throw new Error(
      "Use a browser supporting Web Locks to safely serialize wallet writes.",
    );
  return navigator.locks.request(
    "arkivsight-wallet-writer",
    { ifAvailable: true },
    async (lock) => {
      if (!lock)
        throw new Error(
          "Another ArkivSight tab is preparing a write. Finish it first.",
        );
      return writeEntitiesLocked(parameters, kind);
    },
  );
}
async function writeEntitiesLocked(
  parameters: CreateEntityParameters[],
  kind: string,
) {
  const { account, provider } = await connectWallet();
  const storageKey = `arkivsight:publish:${account.toLowerCase()}`;
  const prior = localStorage.getItem(storageKey);
  if (prior)
    throw new Error(
      `A previous publication needs review. Open Publication recovery before signing again.`,
    );
  const reader = publicClient();
  if ((await reader.getChainId()) !== tiramisu.id)
    throw new Error("RPC network mismatch");
  if ((await reader.getBalance({ address: account })) === 0n)
    throw new Error("This wallet needs test GLM from the Arkiv Hub faucet.");
  const intent = {
    account,
    kind,
    parameters: parameters.map((p) => ({
      attributes: p.attributes,
      payload: Array.from(p.payload),
    })),
    phase: "prepared",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(storageKey, JSON.stringify(intent));
  type RpcRequest = { method: string; params?: unknown };
  const request = provider.request.bind(provider) as unknown as (
    args: RpcRequest,
  ) => Promise<unknown>;
  const guarded = {
    request: async (args: RpcRequest) => {
      if (args.method === "eth_sendTransaction") {
        if (
          (await provider.request({ method: "eth_chainId" })) !== "0x7614d1" ||
          (
            await provider.request({ method: "eth_accounts" })
          )[0]?.toLowerCase() !== account.toLowerCase()
        )
          throw new Error("Wallet changed before signing");
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...intent, phase: "submitting" }),
        );
        let hash: unknown;
        try {
          hash = await request(args);
        } catch (error) {
          // EIP-1193 user rejection establishes that this request was not sent.
          // Timeouts and all other errors remain uncertain and keep the journal.
          if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 4001
          ) {
            localStorage.removeItem(storageKey);
          }
          throw error;
        }
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...intent, phase: "submitted", txHash: hash }),
        );
        return hash;
      }
      return request(args);
    },
  };
  const writer = createWalletClient({
    chain: tiramisu,
    account,
    transport: custom(guarded, { retryCount: 0 }),
  });
  try {
    const result = await writer.executeBatch({ creates: parameters });
    localStorage.setItem(
      storageKey,
      JSON.stringify({ ...intent, ...result, phase: "receipt_confirmed" }),
    );
    if (result.createdEntities.length !== parameters.length)
      throw new Error(
        "Receipt confirmed; entity count mismatch. Reconcile before another write.",
      );
    const verified = [];
    for (let i = 0; i < parameters.length; i++) {
      const entity = await reader.getEntity(result.createdEntities[i]);
      const payload = parameters[i].payload;
      const attrs = parameters[i].attributes ?? {};
      const matching = Object.entries(attrs).every(([name, v]) => {
        const actual = entity.attributes[name];
        return typeof v === "object" && v !== null && "type" in v
          ? actual?.type === v.type && String(actual.value) === String(v.value)
          : String(actual?.value) === String(v);
      });
      if (
        entity.creator.toLowerCase() !== account.toLowerCase() ||
        entity.owner.toLowerCase() !== account.toLowerCase() ||
        entity.contentType !== "application/json" ||
        !entity.creationFlags.readonly ||
        !matching ||
        !entity.payload ||
        entity.payload.length !== payload.length ||
        !payload.every((b, j) => b === entity.payload[j])
      )
        throw new Error(
          "Receipt confirmed; read-back mismatch. Preserve the publication journal.",
        );
      verified.push({
        entityKey: entity.key,
        txHash: result.txHash,
        expiresAt: entity.expiresAt.toString(),
      });
    }
    localStorage.setItem(
      "arkivsight:last-publication",
      JSON.stringify({ kind, entities: verified, account }),
    );
    localStorage.removeItem(storageKey);
    return verified;
  } catch (error) {
    const journal = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
    if (journal.phase === "prepared") localStorage.removeItem(storageKey);
    throw error;
  }
}

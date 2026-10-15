import { beforeEach, expect, it, vi } from "vitest";
import { defaultWidget } from "../lib/dashboard";
import { demoQuery } from "../lib/query";

const mocks = vi.hoisted(() => ({
  request: vi.fn(),
  getEntity: vi.fn(),
  mode: "reject",
}));
vi.mock("../lib/arkiv", () => ({
  publicClient: () => ({
    getChainId: async () => 7738577,
    getBalance: async () => 1n,
    getEntity: mocks.getEntity,
  }),
}));
vi.mock("@arkiv-network/sdk", async (original) => ({
  ...(await original<typeof import("@arkiv-network/sdk")>()),
  createWalletClient: ({
    transport,
  }: {
    transport: (args: object) => {
      request: (args: object) => Promise<unknown>;
    };
  }) => ({
    executeBatch: async () => {
      await transport({}).request({
        method: "eth_sendTransaction",
        params: [{}],
      });
      return {
        txHash: "0x" + "b".repeat(64),
        createdEntities: ["0x" + "a".repeat(64)],
      };
    },
  }),
}));
import { publishDashboard } from "../lib/wallet";
const account = "0x" + "1".repeat(40);
const storageKey = `arkivsight:publish:${account}`;
const spec = {
  version: 1 as const,
  network: "tiramisu" as const,
  title: "Offline wallet test",
  description: "No real transactions",
  query: demoQuery,
  widgets: [defaultWidget],
  refreshSeconds: 60,
  createdAt: "2026-10-15T00:00:00.000Z",
};
beforeEach(() => {
  vi.clearAllMocks();
  const values = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
  vi.stubGlobal("navigator", {
    locks: {
      request: async (
        _name: string,
        _options: object,
        callback: (lock: object) => unknown,
      ) => callback({}),
    },
  });
  mocks.request.mockImplementation(async ({ method }: { method: string }) => {
    if (method === "eth_requestAccounts" || method === "eth_accounts")
      return [account];
    if (method === "eth_chainId") return "0x7614d1";
    if (method === "eth_sendTransaction") {
      if (mocks.mode === "reject")
        throw { code: 4001, message: "User rejected" };
      if (mocks.mode === "timeout") throw new Error("Network timeout");
      return "0x" + "b".repeat(64);
    }
  });
  vi.stubGlobal("window", { ethereum: { request: mocks.request } });
});
it("clears an explicitly rejected send so the user can try again", async () => {
  mocks.mode = "reject";
  await expect(publishDashboard(spec)).rejects.toBeDefined();
  expect(localStorage.getItem(storageKey)).toBeNull();
  await expect(publishDashboard(spec)).rejects.toBeDefined();
  expect(
    mocks.request.mock.calls.filter(
      ([args]) => args.method === "eth_sendTransaction",
    ),
  ).toHaveLength(2);
});
it("preserves an uncertain send and blocks a duplicate", async () => {
  mocks.mode = "timeout";
  await expect(publishDashboard(spec)).rejects.toBeDefined();
  expect(JSON.parse(localStorage.getItem(storageKey)!).phase).toBe(
    "submitting",
  );
  await expect(publishDashboard(spec)).rejects.toThrow("previous publication");
  expect(
    mocks.request.mock.calls.filter(
      ([args]) => args.method === "eth_sendTransaction",
    ),
  ).toHaveLength(1);
});
it("preserves receipt and keys when read-back is unavailable", async () => {
  mocks.mode = "sent";
  mocks.getEntity.mockRejectedValue(new Error("RPC unavailable"));
  await expect(publishDashboard(spec)).rejects.toThrow("RPC unavailable");
  const journal = JSON.parse(localStorage.getItem(storageKey)!);
  expect(journal.phase).toBe("receipt_confirmed");
  expect(journal.createdEntities).toHaveLength(1);
  expect(journal.txHash).toBe("0x" + "b".repeat(64));
});

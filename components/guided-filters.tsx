"use client";
import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { isAddress } from "viem";
import { fieldSchema, type Filter, type QuerySpec } from "@/lib/query";
import {
  chooseField,
  operatorChoices,
  publisherQuery,
  systemField,
  systemFields,
  type ObservedFields,
} from "@/lib/query-guidance";

const types = [
  "str",
  "i32",
  "u64",
  "u256",
  "dec",
  "bool",
  "addr",
  "key",
] as const;
const operators = {
  eq: "equals",
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  prefix: "starts with",
};
export default function GuidedFilters({
  query,
  onChange,
  fields,
}: {
  query: QuerySpec;
  onChange: (query: QuerySpec) => void;
  fields: ObservedFields;
}) {
  const [publisherOpen, setPublisherOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [scope, setScope] = useState<"$creator" | "$owner">("$creator");
  const [message, setMessage] = useState("");
  const [walletBusy, setWalletBusy] = useState(false);
  const addressInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (publisherOpen) addressInput.current?.focus();
  }, [publisherOpen]);
  const observed = fields.filter(
    ([name]) => !name.startsWith("$") && fieldSchema.safeParse(name).success,
  );
  function update(index: number, filter: Filter) {
    onChange({
      ...query,
      filters: query.filters.map((value, i) => (i === index ? filter : value)),
    });
  }
  function applyPublisher(value: string) {
    try {
      onChange(publisherQuery(query, value, scope));
      setAddress(value.trim());
      setPublisherOpen(false);
      setMessage("");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not set publisher filter.",
      );
    }
  }
  async function mine() {
    setMessage("");
    setScope("$creator");
    const provider = window.ethereum;
    if (!provider) {
      setPublisherOpen(true);
      setMessage(
        "Paste your wallet address below. Reading your records needs no wallet connection.",
      );
      return;
    }
    setWalletBusy(true);
    try {
      // An address request only: no chain switch, signature or transaction for reads.
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      if (!account || !isAddress(account))
        throw new Error("Choose a wallet account or paste its address.");
      onChange(publisherQuery(query, account, "$creator"));
      setAddress(account);
      setPublisherOpen(false);
    } catch (error) {
      setPublisherOpen(true);
      setMessage(
        error instanceof Error && error.message.startsWith("A query supports")
          ? error.message
          : "Wallet access was not completed. You can paste your wallet address to read records instead.",
      );
    } finally {
      setWalletBusy(false);
    }
  }
  return (
    <>
      <div className="query-shortcuts">
        <button disabled={walletBusy} onClick={() => void mine()}>
          {walletBusy ? "Reading wallet address…" : "My records"}
        </button>
        <button
          onClick={() => {
            setPublisherOpen(!publisherOpen);
            setMessage("");
          }}
        >
          Filter by publisher
        </button>
        <span>
          Shortcuts keep your other conditions. Then select Run query.
        </span>
      </div>
      {publisherOpen && (
        <section className="publisher-filter" aria-label="Publisher filter">
          <label>
            Records
            <select
              aria-label="Publisher relationship"
              value={scope}
              onChange={(event) => setScope(event.target.value as typeof scope)}
            >
              <option value="$creator">Created by this wallet</option>
              <option value="$owner">Currently owned by this wallet</option>
            </select>
          </label>
          <label>
            Wallet address
            <input
              ref={addressInput}
              aria-label="Publisher wallet address"
              value={address}
              placeholder="0x followed by 40 hexadecimal characters"
              maxLength={42}
              spellCheck={false}
              onChange={(event) => setAddress(event.target.value)}
            />
          </label>
          <button
            disabled={!isAddress(address.trim())}
            onClick={() => applyPublisher(address)}
          >
            Apply publisher filter
          </button>
          <p className="hint" role="status">
            {message ||
              "Addresses filter canonical Arkiv metadata. No wallet signature or chain switch is needed."}
          </p>
        </section>
      )}
      <div className="query-intro">
        <span className="eyebrow">FILTERS</span>
        <span>
          Match <b>all</b> conditions
        </span>
      </div>
      {!!query.filters.length && (
        <div className="filter-labels">
          <span>Field</span>
          <span>Type</span>
          <span>Operator</span>
          <span>Value</span>
        </div>
      )}
      {!query.filters.length && (
        <div className="notice">
          No filters. All currently available public entities are eligible;
          results load one page at a time.
        </div>
      )}
      {query.filters.map((filter, index) => {
        const canonical = systemField(filter.field);
        const known =
          !!canonical || observed.some(([name]) => name === filter.field);
        const conflicting = fields.find(([name]) => name === filter.field)?.[1]
          .size;
        return (
          <div className="guided-condition" key={index}>
            <div className="filter-row">
              <div>
                <select
                  aria-label={`Field ${index + 1}`}
                  value={!filter.field ? "" : known ? filter.field : "__custom"}
                  onChange={(event) =>
                    update(
                      index,
                      chooseField(
                        filter,
                        event.target.value === "__custom"
                          ? "custom_field"
                          : event.target.value,
                        fields,
                      ),
                    )
                  }
                >
                  <option value="" disabled>
                    Choose a field
                  </option>
                  <optgroup label="Verified entity metadata">
                    {Object.entries(systemFields).map(([name, meta]) => (
                      <option key={name} value={name}>
                        {meta.label}
                      </option>
                    ))}
                  </optgroup>
                  {!!observed.length && (
                    <optgroup label="Indexed attributes on this page">
                      {observed.map(([name, values]) => (
                        <option key={name} value={name}>
                          {name} ({[...values].join(" / ")})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <option value="__custom">Custom indexed attribute…</option>
                </select>
                {!!filter.field && !known && (
                  <input
                    aria-label={`Custom attribute ${index + 1}`}
                    value={filter.field}
                    placeholder="e.g. app"
                    maxLength={32}
                    onChange={(event) =>
                      update(
                        index,
                        chooseField(filter, event.target.value, fields),
                      )
                    }
                  />
                )}
              </div>
              <select
                aria-label={`Type ${index + 1}`}
                disabled={!!canonical}
                value={filter.type}
                onChange={(event) => {
                  const type = event.target.value as Filter["type"];
                  update(index, {
                    ...filter,
                    type,
                    op: operatorChoices(type).some((op) => op === filter.op)
                      ? filter.op
                      : "eq",
                  });
                }}
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                aria-label={`Operator ${index + 1}`}
                value={filter.op}
                onChange={(event) =>
                  update(index, {
                    ...filter,
                    op: event.target.value as Filter["op"],
                  })
                }
              >
                {operatorChoices(filter.type).map((op) => (
                  <option key={op} value={op}>
                    {operators[op]}
                  </option>
                ))}
              </select>
              <input
                aria-label={`Value ${index + 1}`}
                value={filter.value}
                placeholder={
                  filter.type === "addr"
                    ? "Wallet address (0x…)"
                    : filter.type === "key"
                      ? "Entity key (0x…)"
                      : filter.type === "bool"
                        ? "true or false"
                        : filter.type === "str"
                          ? "Text value"
                          : "Numeric value"
                }
                spellCheck={false}
                onChange={(event) =>
                  update(index, { ...filter, value: event.target.value })
                }
              />
              <button
                className="icon-button"
                aria-label={`Remove filter ${index + 1}`}
                onClick={() =>
                  onChange({
                    ...query,
                    filters: query.filters.filter((_, i) => i !== index),
                  })
                }
              >
                <X size={14} />
              </button>
            </div>
            {(canonical || (conflicting ?? 0) > 1) && (
              <p className="hint">
                {canonical
                  ? `${canonical.label}: ${canonical.help} Type is selected automatically.`
                  : "Multiple types occur for this attribute. Choose the type used by the records you need."}
              </p>
            )}
          </div>
        );
      })}
      <datalist id="attributes">
        {Object.keys(systemFields).map((name) => (
          <option key={name}>{name}</option>
        ))}
        {observed.map(([name]) => (
          <option key={name}>{name}</option>
        ))}
      </datalist>
      <div className="filter-actions">
        <button
          className="text-button"
          disabled={query.filters.length >= 12}
          onClick={() =>
            onChange({
              ...query,
              filters: [
                ...query.filters,
                { field: "", type: "str", op: "eq", value: "" },
              ],
            })
          }
        >
          <Plus size={15} />
          Add condition
        </button>
        <button
          className="text-button"
          disabled={!query.filters.length}
          onClick={() => onChange({ ...query, filters: [] })}
        >
          Clear all filters
        </button>
      </div>
    </>
  );
}

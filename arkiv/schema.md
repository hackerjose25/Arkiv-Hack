# Arkiv schema — PROPOSED, not yet deployed

**Status:** Design only as of 2026-10-14. Every item here must be cross-checked with installed Arkiv SDK 0.8.x, live sample entities, and exact working queries. After implementing, replace hypothetical fields and attach transaction/entity references. The final file must describe **actual** deployed schema and query paths.

## Rules
- Put filterable typed values in Arkiv **attributes**; descriptive and structured data in JSON **payload**.
- Every record belongs to `app: "arkivsight"`, with `kind` distinguishing entity types; avoid pretending `kind` is a built-in type.
- Avoid user personal information in both attributes and payload, including hashes. All seed data synthetic.
- Schema version each dashboard spec. Treat entity payloads as untrusted and validate them with Zod.
- Expiration is real. Set intentional lifetimes, show expiry/renewal requirements, and avoid promising permanent archives.

## Entity A: Synthetic demo metric (`kind=demo_metric`)
**Purpose:** stable public dataset to demonstrate query, sorting, paging, aggregation and reload.

**Proposed attributes:** `app: string = "arkivsight"`, `kind: string = "demo_metric"`, `dataset: string = "sample_metrics_v1"`, `category: string`, `region: string`, `period: number` (UTC epoch or YYYYMM numeric consistently), `value: number`, `sequence: number`. Use numeric attributes for numeric range queries.

**Payload:** `{"label":"Synthetic metric", "description":"Demo-only fabricated values", "unit":"requests"}`. **Expiration:** 30 days initially; may extend if docs and wallet permissions allow. State if dataset has missing/expired entities.

**Expected queries to validate (DSL intent, not literal SDK calls):**
- `app == arkivsight AND kind == demo_metric`
- `dataset == sample_metrics_v1 AND category == A`
- `region == Chennai AND value >= 10 AND value <= 100`, sort by `period` if supported, paginate via returned cursor.

## Entity B: Dashboard definition (`kind=dashboard`)
**Purpose:** dashboard publishing and independent public retrieval via entity key, no custom database.

**Proposed attributes:** `app: "arkivsight"`, `kind: "dashboard"`, `schemaVersion: 1`, `publicId: string` (non-PII opaque ID), `displayCategory: string`, optional `publishedAt: number`.

**Payload shape (strict versioned JSON):**
```json
{
  "version": 1,
  "title": "Sample Arkiv Metrics",
  "description": "Demonstration dashboard with synthetic records",
  "network": "tiramisu",
  "queries": [
    {
      "id": "q1",
      "filters": [
        {"field": "app", "op": "eq", "value": "arkivsight"},
        {"field": "kind", "op": "eq", "value": "demo_metric"}
      ],
      "limit": 100,
      "sort": [{"field": "period", "direction": "asc"}]
    }
  ],
  "widgets": [
    {"id": "w1", "queryId": "q1", "type": "bar", "groupBy": "category", "measure": "value", "aggregation": "sum", "title": "Demo totals"}
  ],
  "layout": [{"widgetId":"w1", "x":0, "y":0, "w":6, "h":4}],
  "refreshSeconds": 60
}
```
**Expiration:** 90 days planned; UI must show expiry and avoid broken-share promises. Later renewal by authorized owner if valid. Do not store arbitrary URLs, code, secrets or large data dumps in definitions.

**Expected queries:** lookup by actual entity key for shared public page; list by `app` + `kind` (+ `$creator`/`createdBy` if SDK supports) for owner dashboards. Canonical creator/owner are Arkiv metadata, NOT custom attributes.

## Optional Entity C: Dashboard revisions (`kind=dashboard_revision`)
Only implement after M4. New snapshot per revision; attribute `parentId`, numeric `revision`, optional `publishedAt`; payload contains validated dashboard spec and previous reference. Expiration 90 days. This does **not** automatically guarantee immutable history if owner can delete entities; don't promise stronger guarantees than tested.

## Query compiler contract
`QuerySpec = { filters: {field, op, value}[], sort?: {...}[], limit: number, cursor?: string }`.
- Allowlist field names discovered from attributes; prevent arbitrary text from becoming executable code.
- Map UI operators to actual SDK filter functions verified from installed version.
- Prevent invalid mixed-type ranges, excess page sizes and unsupported sorts.
- Enforce mandatory demo namespace where relevant (e.g. `app=arkivsight`) but permit exploring other public datasets deliberately.
- Track `fetchedCount`, pagination completeness and `scope: page|complete` for honest aggregations.

## On-chain evidence ledger — fill only after genuine writes
| Type | Writer wallet (public) | Entity key | Tx hash | Expiry observed | Query tested | Verification date |
|---|---|---|---|---|---|---|
| demo_metric | NOT YET | NOT YET | NOT YET | NOT YET | NOT YET | — |
| dashboard | NOT YET | NOT YET | NOT YET | NOT YET | NOT YET | — |

## SDK/API verification checklist
- [ ] Create synthetic record with valid typed attribute values.
- [ ] Query compound predicates from public client (no wallet required to read).
- [ ] Confirm cursor pagination and sort behavior.
- [ ] Inspect entity `key`, `$creator`, `$owner` as actual returned metadata.
- [ ] Save and independently retrieve dashboard payload by key.
- [ ] Confirm expiry handling and optional extension semantics.
- [ ] Record exact SDK version + tx/explorer references.

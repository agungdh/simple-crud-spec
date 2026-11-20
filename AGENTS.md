# AGENTS.md

Panduan untuk agent/AI (dan manusia) yang bekerja di repo ini.

## Tujuan

Repo ini berisi **spesifikasi OpenAPI** (kontrak API) untuk layanan CRUD sederhana.
Spec adalah sumber kebenaran: implementasi mengikuti spec, bukan sebaliknya.

## Struktur yang diharapkan

```
openapi.yaml        # entry point (OpenAPI 3.1.0), hanya berisi info, servers, tags, $ref
paths/              # satu file per resource, mis. paths/users.yaml
components/         # schemas/, parameters/, responses/, securitySchemes/
examples/           # contoh request/response yang di-$ref
```

File besar dipecah per resource dan disatukan lewat `$ref`. Jangan menaruh seluruh
spec di satu file raksasa.

## Aturan penulisan spec

- Versi: **OpenAPI 3.1.0** (JSON Schema 2020-12).
- YAML, indentasi 2 spasi, tanpa tab. Urutan kunci per operasi:
  `summary` → `description` → `operationId` → `tags` → `parameters` → `requestBody` → `responses`.
- Path: plural, kebab-case, dengan prefix versi: `/v1/users`, `/v1/order-items`.
- `operationId`: camelCase, pola `verbResource` — `listUsers`, `getUser`, `createUser`,
  `updateUser`, `deleteUser`.
- Field JSON: `camelCase`. Nilai enum: `SCREAMING_SNAKE_CASE`.
- Setiap operasi wajib punya `summary`, `operationId`, `tags`, minimal satu response 2xx,
  satu response 4xx, dan schema request/response yang di-`$ref` (tidak inline).
- Semua schema wajib punya `description` dan `examples`. Field `required` harus eksplisit.
- Tanggal saja → `format: date`; waktu → `format: date-time` (RFC 3339, UTC).
- ID di path → `type: string`, `format: uuid` (kecuali diputuskan lain dan dicatat di sini).

## Konvensi error

Semua error memakai envelope yang sama:

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "details": [{ "field": "id", "issue": "not found" }]
  }
}
```

| Status | code               |
| ------ | ------------------ |
| 400    | `VALIDATION_ERROR` |
| 401    | `UNAUTHORIZED`     |
| 403    | `FORBIDDEN`        |
| 404    | `NOT_FOUND`        |
| 409    | `CONFLICT`         |
| 422    | `UNPROCESSABLE`    |
| 500    | `INTERNAL_ERROR`   |

## Konvensi list & pagination

- Query: `limit` (1–100, default 20) + `cursor` (opaque string).
- Response: `{ "data": [...], "nextCursor": "..." | null }`.
- Filter dan sorting didokumentasikan sebagai `parameters` dengan `style: form`.

## Validasi

Jalankan sebelum commit / membuka PR:

```bash
npx @redocly/cli lint openapi.yaml
npx @redocly/cli bundle openapi.yaml -o dist/openapi.yaml
```

Lint harus **0 error**. Warning yang tidak bisa dihindari diberi komentar alasan.
Jangan menonaktifkan rule global hanya untuk meloloskan satu file.

## Git

- Branch: `main` (stabil), kerja di `feat/<topik>` atau `fix/<topik>`.
- Commit kecil dan fokus; pesan: `spec(users): tambah endpoint update`.
- Perubahan yang **breaking** (rename field, hapus endpoint, ubah tipe) wajib ditandai
  di deskripsi commit/PR dan disertai catatan migrasi.

## Larangan

- Jangan mengubah `openapi.yaml` untuk "menyesuaikan" dengan bug implementasi tanpa
  diskusi — spec adalah kontrak.
- Jangan commit file hasil generate (`dist/`, `node_modules/`).
- Jangan menambahkan placeholder `TODO` di spec yang dilint; gunakan issue sebagai gantinya.

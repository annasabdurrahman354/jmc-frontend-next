# Prototipe JMC Admin - Next.js

Sistem Informasi Kepegawaian JMC — Frontend Admin Panel

---

## Deskripsi

Aplikasi frontend admin untuk Sistem Informasi Kepegawaian JMC, dibangun menggunakan **Next.js 16** (App Router) dengan integrasi penuh ke backend `jmc-backend` (Express, MariaDB, JWT).

## Stack Teknologi

| Layer | Teknologi |
|---|---|
| Framework | Next.js 16.2.9 (App Router) |
| UI | React 19 + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova) |
| State | Zustand (auth + RBAC) |
| Form | react-hook-form + Zod |
| HTTP | Axios (JWT interceptor + 401 auto-logout) |

---

## Setup & Konfigurasi

### 1. Prerequisites

- Node.js v20.9+ (LTS)
- Backend `jmc-backend` berjalan di `localhost:3001`

### 2. Install dependencies

```bash
npm install
```

### 3. Konfigurasi Environment

Buat file `.env.local` di folder ini:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### 4. Jalankan dev server

```bash
npm run dev
```

Aplikasi berjalan di `http://localhost:3000`.

---

## Struktur Folder

```
prototipe-jmc-admin-next/
├── app/
│   ├── (admin)/              # Layout admin (dilindungi AuthGuard)
│   │   ├── page.tsx          # Dashboard
│   │   ├── pegawai/          # Modul Data Pegawai
│   │   │   ├── page.tsx      # List pegawai
│   │   │   ├── [id]/         # Detail pegawai
│   │   │   └── form/         # Create / Edit form
│   │   │       └── [id]/     # Edit mode
│   │   ├── user/
│   │   │   ├── manage/       # Kelola User
│   │   │   └── role/         # Kelola Role + Hak Akses
│   │   ├── tunjangan/
│   │   │   ├── setting/      # Setting Tunjangan Transport
│   │   │   └── transport/    # Modul Tunjangan Transport
│   │   │       └── detail/[id]/
│   │   ├── log/              # Modul Log Aktivitas
│   │   ├── profile/          # My Profile
│   │   ├── print-pages/      # Print-friendly pages
│   │   │   └── pegawai/[id]/
│   │   └── forbidden/        # 403 page
│   ├── (auth)/
│   │   └── login/            # Halaman Login
│   ├── not-found.tsx         # Global 404
│   └── layout.tsx
├── components/
│   ├── auth/                 # AuthGuard, RoleGuard, SessionWarningDialog
│   ├── form/                 # FotoUploader, PendidikanList, KecamatanAutocomplete, PegawaiForm
│   ├── layout/               # AppHeader, AppSidebar, PageHeader
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── api/
│   │   ├── client.ts         # Axios instance + interceptors
│   │   ├── endpoints.ts      # URL constants
│   │   └── types.ts          # TypeScript types
│   ├── auth/
│   │   ├── store.ts          # Zustand auth store
│   │   └── session.ts        # Session timer + activity tracker
│   ├── hooks/
│   │   ├── use-fetch.ts      # Data fetching hook
│   │   ├── use-mutation.ts   # POST/PUT/DELETE hook
│   │   ├── use-paged-table.ts # Paginated table hook
│   │   └── use-debounce.ts   # Debounce hook
│   ├── rbac/
│   │   ├── types.ts          # ModulName, Action types
│   │   └── permissions.ts    # canAccess() helper
│   ├── schemas/              # Zod schemas (auth, user, pegawai, dll)
│   └── utils/                # Formatters, query builders
└── proxy.ts                  # Next.js 16 middleware (route protection)
```

---

## Konvensi RBAC

Sistem RBAC menggunakan Zustand store + permissions yang di-fetch saat login dari `GET /roles/:id`.

```typescript
// Cek akses di komponen
import { RoleGuard } from "@/components/auth/role-guard";

<RoleGuard modul="Modul Data Pegawai" action="create">
  <Button>Tambah Pegawai</Button>
</RoleGuard>
```

```typescript
// Cek akses secara programatik
import { canAccess } from "@/lib/rbac/permissions";
const bisa = canAccess(permissions, "Kelola User", "delete");
```

### Tabel Akses per Role

| Modul | Superadmin | Manager HRD | Admin HRD |
|---|---|---|---|
| Dashboard | ✅ welcome | ✅ widgets+chart | ✅ welcome |
| Kelola Role | ✅ R | ❌ | ❌ |
| Kelola User | ✅ CRUD | ❌ | ❌ |
| Data Pegawai | ❌ | ✅ R | ✅ CRUD |
| Setting Tunjangan | ❌ | ❌ | ✅ CRUD |
| Tunjangan Transport | ❌ | ✅ R | ✅ R |
| Modul Log | ✅ R | ❌ | ❌ |
| My Profile | ✅ RUO | ✅ RUO | ✅ RUO |

---

## Session Management

- **Session timeout**: 3 menit inaktivitas → auto logout
- **Warning**: 30 detik sebelum logout, dialog muncul dengan opsi "Perpanjang Sesi"
- **Remember Me**: Jika dicentang, sesi tidak expired (harus logout manual)
- Token disimpan di `localStorage` dan di-mirror ke cookie `auth-token` agar `proxy.ts` bisa baca

---

## Link Swagger Backend

Setelah backend berjalan, dokumentasi API tersedia di:
```
http://localhost:3001/docs
```

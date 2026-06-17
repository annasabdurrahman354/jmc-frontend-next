export const ENDPOINTS = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
  },
  users: {
    me: "/users/me",
    updateMe: "/users/me",
    changePassword: "/users/me/password",
    list: "/users",
    create: "/users",
    detail: (id: number | string) => `/users/${id}`,
    update: (id: number | string) => `/users/${id}`,
    delete: (id: number | string) => `/users/${id}`,
    status: (id: number | string) => `/users/${id}/status`,
  },
  roles: {
    list: "/roles",
    detail: (id: number | string) => `/roles/${id}`,
  },
  pegawai: {
    list: "/pegawai",
    create: "/pegawai",
    bulkStatus: "/pegawai/bulk-status",
    export: "/pegawai/export",
    detail: (id: number | string) => `/pegawai/${id}`,
    update: (id: number | string) => `/pegawai/${id}`,
    delete: (id: number | string) => `/pegawai/${id}`,
  },
  settingTunjangan: {
    list: "/setting-tunjangan",
    create: "/setting-tunjangan",
    detail: (id: number | string) => `/setting-tunjangan/${id}`,
    update: (id: number | string) => `/setting-tunjangan/${id}`,
    delete: (id: number | string) => `/setting-tunjangan/${id}`,
  },
  tunjangan: {
    list: "/tunjangan",
    create: "/tunjangan",
    detail: (id: number | string) => `/tunjangan/${id}`,
    hitung: (id: number | string) => `/tunjangan/${id}/hitung`,
  },
  masterData: {
    list: (tipe: "jabatan" | "departemen") => `/master-data?tipe=${tipe}`,
    detail: (id: number | string) => `/master-data/${id}`,
  },
  masterWilayah: {
    list: () => `/master-wilayah`,
    search: (q: string) => `/master-wilayah/search?q=${encodeURIComponent(q)}`,
    detail: (id: number | string) => `/master-wilayah/${id}`,
  },
  dashboard: "/dashboard",
  log: "/log",
} as const;

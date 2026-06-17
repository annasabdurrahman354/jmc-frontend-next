export const formatDateID = (date: string | number | Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
};

export const formatDateTimeID = (date: string | number | Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

export const formatTimeID = (date: string | number | Date) => {
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// Format tanggal ke YYYY-MM-DD untuk <input type="date">.
// Ambil dari ISO string (atau Date) dan normalisasi ke UTC agar tidak
// bergeser karena timezone lokal.
export const formatDateInput = (date: string | number | Date | null | undefined): string => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

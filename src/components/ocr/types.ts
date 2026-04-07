export interface OcrResult {
  name: string | null;
  date: string | null;
  amount: string | null;
  policy_number: string | null;
  damage_type: string | null;
  raw_text: string;
}

export interface BatchFile {
  id: string;
  file: File;
  preview: string | null;
  status: "pending" | "scanning" | "done" | "error";
  result: OcrResult | null;
  error: string | null;
}

export const OCR_FIELDS = [
  { key: "name" as const, label: "Name", icon: "👤" },
  { key: "date" as const, label: "Date", icon: "📅" },
  { key: "amount" as const, label: "Amount", icon: "💰" },
  { key: "policy_number" as const, label: "Policy Number", icon: "📋" },
  { key: "damage_type" as const, label: "Damage Type", icon: "⚠️" },
];

export const VALID_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_BATCH_FILES = 10;

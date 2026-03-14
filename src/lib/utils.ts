import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const IMGBB_API_KEY = 'da736db48f154b9108b23a36d4393848';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Upload a File to imgbb and return its public display URL */
export async function uploadFile(file: File): Promise<string> {
  const base64 = await fileToBase64(file);
  const form   = new FormData();
  form.append('key', IMGBB_API_KEY);
  form.append('image', base64);
  form.append('name', `${Date.now()}-${file.name}`);

  const res  = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  const data = await res.json();

  if (!data.success) throw new Error(data.error?.message || 'Falha no upload para imgbb');

  // data.data.display_url is the direct image URL
  return data.data.display_url as string;
}

/** Convert File to base64 string (without data: prefix) */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Format a currency value in BRL */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

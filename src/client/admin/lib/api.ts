// Admin API client. Every request carries the CSRF header the server expects.
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: () => void = () => {};
/** Called when the session has expired (any 401 except the login itself). */
export const setUnauthorizedHandler = (fn: () => void) => (onUnauthorized = fn);

export async function api<T = any>(path: string, { method = 'GET', body }: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api/admin${path}`, {
    method,
    headers: { 'X-Requested-With': 'vieture-admin', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });
  const json = await res.json().catch(() => ({ ok: false, error: `HTTP ${res.status}` }));
  if (res.status === 401 && path !== '/login') {
    onUnauthorized();
    throw new ApiError('Phiên đăng nhập đã hết hạn.', 401);
  }
  if (!res.ok || json.ok === false) throw new ApiError(json.error || `HTTP ${res.status}`, res.status);
  return json as T;
}

const ERRORS: Record<string, string> = {
  invalid_credentials: 'Sai tên đăng nhập hoặc mật khẩu.',
  rate_limited: 'Đăng nhập sai quá nhiều lần. Thử lại sau 15 phút.',
  conflict: 'Nội dung vừa được người khác lưu. Hãy tải lại trang để lấy bản mới nhất.',
  forbidden: 'Bạn không có quyền làm việc này.',
  csrf: 'Yêu cầu không hợp lệ.',
};
export const errMsg = (e: unknown) => {
  const m = e instanceof Error ? e.message : String(e);
  return ERRORS[m] || m;
};

const MAX_UPLOAD = 4 * 1024 * 1024;
const MAX_SIDE = 1920;

const readDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(blob);
  });

/**
 * Photos are shrunk in the browser before upload: longest side at most 1920px, saved as WebP.
 * Small images (logos, icons) and GIFs (may be animated) are uploaded unchanged.
 */
async function optimizeImage(file: File): Promise<Blob> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type) || typeof createImageBitmap !== 'function') return file;
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    return file; // the browser cannot decode it; let the server decide
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  if (scale === 1 && file.size < 300 * 1024) return (bmp.close(), file);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.85));
  // Safari may not encode WebP (gives PNG instead): if nothing was resized and it got no smaller, keep the original
  if (!out || (scale === 1 && out.size >= file.size)) return file;
  return out;
}

export async function uploadFile(file: File): Promise<{ url: string }> {
  if (file.size > 25 * 1024 * 1024) throw new Error('Ảnh quá lớn (tối đa 25MB).');
  const blob = await optimizeImage(file);
  if (blob.size > MAX_UPLOAD) throw new Error('Ảnh sau khi nén vẫn lớn hơn 4MB — hãy chọn ảnh nhỏ hơn.');
  return api('/uploads', { method: 'POST', body: { data: await readDataUrl(blob) } });
}

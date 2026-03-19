const SLICKPAY_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://prodapi.slick-pay.com/api/v2"
    : "https://devapi.slick-pay.com/api/v2";

interface SlickPayInvoiceParams {
  amount: number;
  items: { name: string; price: number; quantity: number }[];
  url?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  address?: string;
  webhook_url?: string;
  webhook_signature?: string;
  webhook_meta_data?: Record<string, string>[];
  note?: string;
}

interface SlickPayInvoiceResponse {
  success: number;
  message: string;
  id: number;
  url: string;
  invoice?: {
    url: string;
    deeplink: string;
    serial: string;
    [key: string]: unknown;
  };
}

interface SlickPayInvoiceStatus {
  success: number;
  completed: number;
  data: Record<string, unknown>;
}

interface SlickPayErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

function getApiKey(): string {
  const key = process.env.SLICKPAY_PUBLIC_KEY;
  if (!key) {
    throw new Error("SLICKPAY_PUBLIC_KEY is not configured");
  }
  return key;
}

async function slickPayRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${SLICKPAY_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as SlickPayErrorResponse;
    throw new Error(errorData.message || `SlickPay API error: ${response.status}`);
  }

  return data as T;
}

export async function createInvoice(
  params: SlickPayInvoiceParams
): Promise<SlickPayInvoiceResponse> {
  return slickPayRequest<SlickPayInvoiceResponse>("/users/invoices", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

export async function getInvoiceStatus(
  invoiceId: number
): Promise<SlickPayInvoiceStatus> {
  return slickPayRequest<SlickPayInvoiceStatus>(
    `/users/invoices/${invoiceId}`
  );
}

export function verifyWebhookSignature(
  receivedSignature: string
): boolean {
  const expectedSignature = process.env.SLICKPAY_WEBHOOK_SECRET;
  if (!expectedSignature) return false;
  return receivedSignature === expectedSignature;
}

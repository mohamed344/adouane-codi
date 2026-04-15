// Use production API when SLICKPAY_USE_PRODUCTION=true or in production env
// The dev SATIM sandbox is unreliable (returns 500 errors)
const useProduction =
  process.env.SLICKPAY_USE_PRODUCTION === "true" ||
  process.env.NODE_ENV === "production";

const SLICKPAY_BASE_URL = useProduction
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
  const key = useProduction
    ? process.env.SLICKPAY_PRODUCTION_KEY
    : process.env.SLICKPAY_PUBLIC_KEY;
  const keyName = useProduction ? "SLICKPAY_PRODUCTION_KEY" : "SLICKPAY_PUBLIC_KEY";
  if (!key) {
    throw new Error(`${keyName} is not configured`);
  }
  return key;
}

async function slickPayRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${SLICKPAY_BASE_URL}${endpoint}`;
  console.log(`[SlickPay] ${options.method || "GET"} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();
  console.log(`[SlickPay] Response ${response.status}:`, text.substring(0, 500));

  let data: T;
  try {
    data = JSON.parse(text) as T;
  } catch {
    throw new Error(`SlickPay returned non-JSON (HTTP ${response.status}): ${text.substring(0, 200)}`);
  }

  if (!response.ok) {
    const errorData = data as unknown as SlickPayErrorResponse;
    const details = errorData.errors
      ? Object.entries(errorData.errors).map(([k, v]) => `${k}: ${v.join(", ")}`).join("; ")
      : "";
    const msg = [errorData.message, details].filter(Boolean).join(" — ");
    console.error("[SlickPay] Error details:", JSON.stringify(errorData));
    throw new Error(msg || `SlickPay API error: ${response.status}`);
  }

  return data;
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

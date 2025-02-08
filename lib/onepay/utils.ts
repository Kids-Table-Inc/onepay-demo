import { init } from "@paralleldrive/cuid2";
import { Address } from "viem";

type User = {
  address: string;
  username: string;
  imageUrl: string;
};

type Token = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
};

type Vendor = {
  name: string;
  address: string;
  logoUri: string;
  website: string;
};

type Payment = {
  id: string;
  payer: string;
  recipient: string;
  tokenIn: Token;
  amountIn: string;
  amountOut: string;
  transactionHash: string;
  timestamp: string;
  vendor: Vendor;
};

export type OnePayPayment = Omit<Payment, "payer"> & {
  payer?: User;
  payerAddress: Address;
};

export type OnePayPaymentRequest = {
  paymentId: string;
  recipient: string;
  amount: string;
};

export type OnePayPaymentStatus = "pending" | "success" | "failed";

export const ONEPAY_APP_ID = "app_d9589ab005e18dcf362d2ea26aef669e";
export const ONEPAY_API_URL = "https://onepay.money/api";
export const ONEPAY_RECIPIENT_ADDRESS = "0x02d5fae7ffa927ebed2324c0f46ceb2edfc679f2";

const cuid = init({
  length: 24,
});

export function createId() {
  return cuid();
}

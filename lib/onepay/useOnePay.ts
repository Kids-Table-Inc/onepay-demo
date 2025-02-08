import { useCallback, useEffect, useMemo, useState } from "react";
import { useInterval } from "usehooks-ts";
import { Address, isAddress } from "viem";

import { ONEPAY_API_URL, ONEPAY_APP_ID, OnePayPayment, OnePayPaymentRequest, OnePayPaymentStatus, createId } from "@/lib/onepay/utils";

/**
 * TODO: Replace with true SDK
 */

function getPaymentLink({ recipient, amount }: { recipient: string; amount: number | bigint }) {
  if (!isAddress(recipient)) {
    throw new Error("Invalid recipient address");
  }

  const request = {
    paymentId: createId(),
    recipient,
    amount: amount.toString(),
  } satisfies OnePayPaymentRequest;

  const paymentParams = new URLSearchParams(request);
  const path = `/pay?${paymentParams.toString()}`;

  const deepLinkParams = new URLSearchParams({
    app_id: ONEPAY_APP_ID,
    path,
  });

  return {
    paymentRequest: request,
    url: `https://worldcoin.org/mini-app?${deepLinkParams.toString()}`,
  };
}

type GetPaymentStatusResponse =
  | {
      status: "success";
      payment: OnePayPayment;
      error: null;
    }
  | {
      status: "pending" | "failed";
      payment: null;
      error: null;
    }

async function getPaymentStatus({ id }: { id: string }) {
  const response = await fetch(`${ONEPAY_API_URL}/payments?id=${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch payment status");
  }

  const data = await response.json();
  console.log("polled", data);
  return data as GetPaymentStatusResponse;
}

export type UsePaymentLinkResponse = {
  paymentRequest: OnePayPaymentRequest;
  url: string;
} | null;

export function usePaymentLink({ recipient, amount, enabled = true }: { recipient?: Address; amount?: bigint, enabled?: boolean }) {
  const data = useMemo<UsePaymentLinkResponse>(() => {
    if (!recipient || !amount || !enabled) {
      return null;
    }

    const { paymentRequest, url } = getPaymentLink({ recipient, amount });
    return { paymentRequest, url };
  }, [recipient, amount, enabled]);

  return data;
}

export function useWaitForPayment({
  paymentId,
  onSuccess,
  onError,
}: {
  paymentId?: string;
  onSuccess?: (payment: OnePayPayment) => void;
  onError?: (error: Error) => void;
}) {
  const [status, setStatus] = useState<OnePayPaymentStatus>("pending");

  // Reset the state if the payment changes
  useEffect(() => {
    setStatus("pending");
  }, [paymentId]);

  const pollPaymentStatus = useCallback(async () => {
    if (!paymentId) {
      return;
    }

    console.log("polling", paymentId, status);

    // Don't poll if the payment is already successful or failed
    if (status === "success" || status === "failed") {
      return;
    }

    try {
      const data = await getPaymentStatus({ id: paymentId });  
      if (data.status === "failed") {
        throw new Error("Payment failed");
      }

      setStatus(data.status);
      if (data.status === "success") {
        onSuccess?.(data.payment);
      }
    } catch (error: unknown) {
      const message = (error as Error).message ?? "Payment expired";
      setStatus("failed");
      onError?.(new Error(message));
    }
  }, [paymentId, status, onSuccess, onError]);

  useInterval(() => {
    pollPaymentStatus();
  }, 1000);
}

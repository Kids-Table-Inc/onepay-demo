"use client";

import { motion, AnimatePresence } from "motion/react";
import { QRCode } from "react-qrcode-logo";
import { X } from "lucide-react";
import { useCart } from "./cart-context";
import Image from "next/image";
import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import React from "react";
import { useWaitForPayment } from "@/lib/onepay/useOnePay";
import { usePaymentLink } from "@/lib/onepay/useOnePay";
import { ONEPAY_RECIPIENT_ADDRESS } from "@/lib/onepay/utils";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const isServer = typeof window === "undefined";

export function QRModal({ isOpen, onClose }: QRModalProps) {
  const { items, total, updateQuantity } = useCart();

  const [orderItems, setOrderItems] = useState<typeof items>([]);
  const [completed, setCompleted] = useState(false);

  const link = usePaymentLink({
    recipient: ONEPAY_RECIPIENT_ADDRESS,
    amount: BigInt(total) * BigInt(10 ** 6),
    enabled: isOpen,
  });

  useWaitForPayment({
    paymentId: link?.paymentRequest?.paymentId,
    onSuccess: () => {
      setCompleted(true);
    },
  });

  // Set orderItems when the modal opens
  useEffect(() => {
    if (isOpen) {
      setOrderItems([...items]);
    } else {
      setCompleted(false);
    }
  }, [isOpen, items]);

  const handleClose = () => {
    // Only clear cart if payment was completed
    if (completed) {
      items.forEach((item) => {
        updateQuantity(item.id, item.size, -item.quantity);
      });
    }
    onClose();
  };

  if (isServer) {
    return null;
  }

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 isolate" style={{ zIndex: 99999 }}>
          {/* Background elements */}
          {orderItems.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-0"
            >
              {/* Solid white background */}
              <div className="fixed inset-0 bg-white" />

              {/* Background Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="fixed inset-0 flex items-center justify-center p-12"
              >
                <div className="w-full h-full max-h-[80vh] grid grid-cols-2 gap-4 auto-rows-fr">
                  {orderItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.1,
                        ease: "easeInOut",
                      }}
                      className="relative w-full h-full"
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={index < 4}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Blur Overlay with QR Code or Payment Complete */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 bg-white/60 backdrop-blur-sm"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{
                duration: 0.3,
                delay: items.length > 1 ? 0.2 : 0,
                ease: "easeInOut",
              }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full h-full flex flex-col items-center justify-center p-8"
            >
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                onClick={handleClose}
                className="absolute right-8 top-8 p-2 focus:outline-none"
                aria-label="Close QR code"
              >
                <X className="h-6 w-6" />
              </motion.button>

              <AnimatePresence mode="wait">
                {!completed ? (
                  <motion.div
                    key="qr-code"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex flex-col items-center gap-8"
                  >
                    <motion.p
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="font-mono uppercase text-xl"
                    >
                      SCAN TO PAY
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      className="w-[400px] h-[400px] bg-black rounded-2xl p-6 flex items-center justify-center"
                    >
                      {link?.url && (
                        <QRCode
                          value={link.url}
                          size={300}
                          qrStyle="dots"
                          eyeRadius={5}
                          fgColor="black"
                        />
                      )}
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="payment-complete"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-8"
                  >
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="font-mono uppercase text-xl"
                    >
                      ORDER COMPLETE
                    </motion.p>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="grid grid-cols-2 gap-4 max-w-xl w-full"
                    >
                      {orderItems.map((item, index) => (
                        <motion.div
                          key={`${item.id}-${item.size}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.3,
                            delay: 0.3 + index * 0.1,
                          }}
                          className="aspect-square relative"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

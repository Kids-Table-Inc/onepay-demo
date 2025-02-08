import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useCart } from './cart-context';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';
import React from 'react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QRModal({ isOpen, onClose }: QRModalProps) {
  const { items, updateQuantity } = useCart();
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [orderItems, setOrderItems] = useState<typeof items>([]);

  // Set orderItems when the modal opens
  useEffect(() => {
    if (isOpen) {
      setOrderItems([...items]);
    }
  }, [isOpen, items]);

  const handleTestPayment = () => {
    setPaymentComplete(true);
  };

  const handleClose = () => {
    // Only clear cart if payment was completed
    if (paymentComplete) {
      items.forEach(item => {
        updateQuantity(item.id, item.size, -item.quantity);
      });
    }
    onClose();
  };

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
                        ease: "easeInOut"
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
                ease: "easeInOut"
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
                {!paymentComplete ? (
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
                    <motion.svg
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      width="526" 
                      height="526" 
                      viewBox="0 0 263 263" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="40" y="14" width="184" height="184" rx="29" fill="#1C1E26"/>
                      <g clipPath="url(#clip0_157_5419)">
                        {/* ... existing QR code paths ... */}
                      </g>
                      <rect x="49" y="212" width="166" height="36" rx="18" fill="#1C1E26"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M162 193V198C158.686 198 156 200.686 156 204V206C156 209.314 158.686 212 162 212V235L98 235V212H102C105.314 212 108 209.314 108 206V204C108 200.686 105.314 198 102 198H98V193L162 193Z" fill="#1C1E26"/>
                      {/* ... rest of the SVG elements ... */}
                      <defs>
                        <clipPath id="clip0_157_5419">
                          <rect width="146" height="146" fill="white" transform="translate(59 33)"/>
                        </clipPath>
                      </defs>
                    </motion.svg>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                      onClick={handleTestPayment}
                      className="mt-4 px-8 py-3 bg-black text-white font-mono hover:opacity-90 transition-opacity"
                    >
                      TEST PAYMENT
                    </motion.button>
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
                            delay: 0.3 + (index * 0.1)
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
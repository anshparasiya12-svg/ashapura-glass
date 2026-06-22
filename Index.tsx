/**
 * Generates a WhatsApp API link.
 * @param phone The phone number including country code (e.g., 919876543210).
 * @param message The pre-filled message.
 * @returns A formatted wa.me URL.
 */
export const generateWhatsAppLink = (phone: string, message: string): string => {
  // Strip non-numeric characters from phone
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
};

/**
 * Opens WhatsApp in a new tab with the pre-filled message.
 */
export const shareOnWhatsApp = (phone: string, message: string) => {
  const url = generateWhatsAppLink(phone, message);
  window.open(url, '_blank', 'noopener,noreferrer');
};

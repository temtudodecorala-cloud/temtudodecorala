export function formatPriceBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function sanitizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  // Se informar apenas DDD + número (10 ou 11 dígitos), adiciona código do Brasil (55)
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

export function buildWhatsAppUrl(
  rawPhone: string,
  productName: string,
  price: number
): string | null {
  const phone = sanitizeWhatsAppNumber(rawPhone);
  if (!phone) return null;

  const formattedPrice = formatPriceBRL(price);
  const message = `Olá! Tenho interesse no produto ${productName}, no valor de ${formattedPrice}. Gostaria de mais informações para realizar a compra.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}


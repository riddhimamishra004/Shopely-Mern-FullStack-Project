// Formats a number as Indian Rupee currency, e.g. 2499 -> "₹2,499"
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
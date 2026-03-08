export const CURRENCY = {
  symbol: "৳",
  code: "BDT",
  locale: "en-BD",
};

export const formatPrice = (amount) => {
  return `${CURRENCY.symbol}${Number.parseFloat(amount).toFixed(2)}`;
};

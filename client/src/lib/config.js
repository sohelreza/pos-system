export const CURRENCY = {
  symbol: "Tk",
  code: "BDT",
  locale: "en-BD",
};

export const formatPrice = (amount) => {
  return `${Number.parseFloat(amount).toFixed(2)} ${CURRENCY.symbol}`;
};

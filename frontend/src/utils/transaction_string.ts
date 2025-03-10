const shortenString = (
  str: string | undefined,
  startLength: number,
  endLength: number
): string => {
  if (!str) return "";
  if (str.length <= startLength + endLength) return str;
  return `${str.slice(0, startLength)}...${str.slice(-endLength)}`;
};

export const shortenAddress = (address: string | undefined): string =>
  shortenString(address, 5, 5);

export const shortenTransactionHash = (
  transaction: string | undefined
): string => shortenString(transaction, 10, 10);

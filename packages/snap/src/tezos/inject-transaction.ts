export const injectTransaction = async (
  rawTransaction: string,
  rpcUrl: string,
): Promise<string> => {
  const payload: string = rawTransaction;

  const response = await fetch(`${rpcUrl}injection/operation?chain=main`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch((error: Error) => {
    throw error;
  });

  return await response.json();
};

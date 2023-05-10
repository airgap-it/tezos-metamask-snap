export const broadcastTransaction = async (
  rawTransaction: string,
): Promise<string> => {
  const payload: string = rawTransaction;

  const response = await fetch(
    `https://tezos-node.prod.gke.papers.tech/injection/operation?chain=main`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    },
  ).catch((error: Error) => {
    throw error;
  });

  return await response.json();
};

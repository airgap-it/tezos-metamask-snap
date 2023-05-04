export const getWallet = async () => {
  const tezosNode = await snap.request({
    method: 'snap_getBip32Entropy',
    params: {
      path: ['m', "44'", "1729'", "0'", "0'"],
      curve: 'ed25519',
    },
  });

  return { ed25519: tezosNode };
};

import { getSigner } from './get-signer';

export const sign = async (
  payload: string,
  watermark: Uint8Array | undefined,
  node: { ed25519: any },
) => {
  const signer = await getSigner(node);

  const signature = await signer.sign(payload, watermark);

  return {
    signature,
  };
};

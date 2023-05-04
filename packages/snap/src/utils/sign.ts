import { getSigner } from './get-signer';

export const sign = async (
  payload: string,
  watermark: Uint8Array | undefined,
  node: { ed25519: any },
) => {
  const signer = await getSigner(node);

  const bytes = payload;

  const signature = await signer.sign(bytes, watermark);

  return {
    signature,
  };
};

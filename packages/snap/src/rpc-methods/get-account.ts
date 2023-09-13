import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import { getSigner } from '../utils/get-signer';
import { getWallet } from '../utils/get-wallet';
import { USER_REJECTED_ERROR } from '../utils/errors';

export const tezosGetAccount = async (origin: string) => {
  const wallet = await getWallet();
  const signer = await getSigner(wallet);

  const publicKey = await signer.publicKey();
  const address = await signer.publicKeyHash();

  const approved = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Tezos Account'),
        text(
          `Do you want to allow ${origin} to access your Tezos public key and address?`,
        ),
        copyable(publicKey),
        divider(),
        copyable(address),
      ]),
    },
  });

  if (!approved) {
    throw USER_REJECTED_ERROR();
  }

  return {
    curve: 'ed25519',
    publicKey,
    address,
  };
};

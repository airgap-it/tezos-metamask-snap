import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import { getSigner } from '../utils/get-signer';
import { getWallet } from '../utils/get-wallet';

export const tezosGetAccounts = async (origin: string) => {
  const wallet = await getWallet();
  const signer = await getSigner(wallet);

  const approved = await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'confirmation',
      content: panel([
        heading('Tezos Account'),
        text(
          `Do you want to allow ${origin} to access your Tezos public key and address?`,
        ),
        copyable(await signer.publicKey()),
        divider(),
        copyable(await signer.publicKeyHash()),
      ]),
    },
  });

  console.log('approved', approved);

  return {
    curve: 'ed25519',
    publicKey: await signer.publicKey(),
    address: await signer.publicKeyHash(),
  };
};

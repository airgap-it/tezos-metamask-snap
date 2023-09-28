import { panel, heading, text, copyable, divider } from '@metamask/snaps-ui';
import { getSigner } from '../utils/get-signer';
import { getWallet } from '../utils/get-wallet';
import { METAMASK_UI_BUSY_ERROR, USER_REJECTED_ERROR } from '../utils/errors';
import { confirmationWrapper } from '../utils/confirmation-wrapper';
import { ReturnWrapper } from '../types';
import { isUiBusy } from '../utils/ui-busy';

export const tezosGetAccount = async (
  origin: string,
): ReturnWrapper<{
  curve: string;
  publicKey: string;
  address: string;
}> => {
  if (isUiBusy()) {
    return { error: METAMASK_UI_BUSY_ERROR() };
  }

  const wallet = await getWallet();
  const signer = await getSigner(wallet);

  const publicKey = await signer.publicKey();
  const address = await signer.publicKeyHash();

  const approved = await confirmationWrapper({
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
    return { error: USER_REJECTED_ERROR() };
  }

  return {
    result: {
      curve: 'ed25519',
      publicKey,
      address,
    },
  };
};

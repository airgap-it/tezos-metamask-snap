export const USER_REJECTED_ERROR = () => new Error('User rejected');
export const METHOD_NOT_FOUND_ERROR = () => new Error('Method not found');
export const RPC_NO_URL_ERROR = () => new Error('RPC URL not set');
export const RPC_NO_HTTPS_ERROR = () =>
  new Error('RPC URL needs to start with https://');
export const RPC_INVALID_URL_ERROR = () => new Error('Invalid RPC URL');
export const RPC_INVALID_RESPONSE_ERROR = () =>
  new Error('Invalid RPC response');
export const TEZOS_INTERNAL_ERROR = (json: any) =>
  new Error(`An internal operation produced an error ${JSON.stringify(json)}`);
export const TEZOS_OPERATION_ERROR = (json: any) =>
  new Error(`The operation produced an error ${JSON.stringify(json)}`);
export const TEZOS_INTERNAL_OP_COUNT_MISMATCH_ERROR = (
  l1: number,
  l2: number,
) =>
  new Error(
    `Run Operation did not return same number of operations. Locally we have ${l1}, but got back ${l2}`,
  );
export const FETCH_BALANCE_ERROR = () => new Error('Error fetching balance');
export const PROPERTY_NOT_DEFINED_ERROR = (property: string) =>
  new Error(`property "${property}" was not defined`);
export const PROPERTY_NOT_DEFINED_WITH_DATA_ERROR = (
  property: string,
  data: any,
) =>
  new Error(`property "${property}" was not defined ${JSON.stringify(data)}`);
export const UNSUPPORTED_OPERATION_KIND_ERROR = (kind: string) =>
  new Error(`unsupported operation type "${kind}"`);
export const NETWORK_ERROR = (error: any) =>
  new Error(`Network error: ${JSON.stringify(error)}`);
export const HEX_LENGTH_INVALID_ERROR = () =>
  new Error('Hex String has invalid length');
export const HEX_CHARACTER_INVALID_ERROR = () =>
  new Error('Hex String has invalid character');
export const NO_OPERATION_ERROR = () => new Error('Empty operations array');

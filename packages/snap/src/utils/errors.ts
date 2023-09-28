export enum ErrorCodes {
  USER_REJECTED = 3000,
  METHOD_NOT_FOUND = 3001,
  RPC_NO_URL = 3002,
  RPC_NO_HTTPS = 3003,
  RPC_INVALID_URL = 3004,
  RPC_INVALID_RESPONSE = 3005,
  TEZOS_INTERNAL = 3006,
  TEZOS_OPERATION = 3007,
  TEZOS_INTERNAL_OP_COUNT_MISMATCH = 3008,
  FETCH_BALANCE = 3009,
  PROPERTY_NOT_DEFINED = 3010,
  PROPERTY_NOT_DEFINED_WITH_DATA = 3011,
  UNSUPPORTED_OPERATION_KIND = 3012,
  NETWORK = 3013,
  HEX_LENGTH_INVALID = 3014,
  HEX_CHARACTER_INVALID = 3015,
  NO_OPERATION = 3016,
  METAMASK_UI_BUSY = 3017,
}

export type ErrorWrapper = {
  code: number;
  error: Error;
};

const createError = (code: number, message: string): ErrorWrapper => {
  return { code, error: new Error(message) };
};

export const USER_REJECTED_ERROR = () =>
  createError(ErrorCodes.USER_REJECTED, 'User rejected');
export const METHOD_NOT_FOUND_ERROR = () =>
  createError(ErrorCodes.METHOD_NOT_FOUND, 'Method not found');
export const RPC_NO_URL_ERROR = () =>
  createError(ErrorCodes.RPC_NO_URL, 'RPC URL not set');
export const RPC_NO_HTTPS_ERROR = () =>
  createError(ErrorCodes.RPC_NO_HTTPS, 'RPC URL needs to start with https://');
export const RPC_INVALID_URL_ERROR = () =>
  createError(ErrorCodes.RPC_INVALID_URL, 'Invalid RPC URL');
export const RPC_INVALID_RESPONSE_ERROR = () =>
  createError(ErrorCodes.RPC_INVALID_RESPONSE, 'Invalid RPC response');
export const TEZOS_INTERNAL_ERROR = (json: any) =>
  createError(
    ErrorCodes.TEZOS_INTERNAL,
    `An internal operation produced an error ${JSON.stringify(json)}`,
  );
export const TEZOS_OPERATION_ERROR = (json: any) =>
  createError(
    ErrorCodes.TEZOS_OPERATION,
    `The operation produced an error ${JSON.stringify(json)}`,
  );
export const TEZOS_INTERNAL_OP_COUNT_MISMATCH_ERROR = (
  l1: number,
  l2: number,
) =>
  createError(
    ErrorCodes.TEZOS_INTERNAL_OP_COUNT_MISMATCH,
    `Run Operation did not return same number of operations. Locally we have ${l1}, but got back ${l2}`,
  );
export const FETCH_BALANCE_ERROR = () =>
  createError(ErrorCodes.FETCH_BALANCE, 'Error fetching balance');
export const PROPERTY_NOT_DEFINED_ERROR = (property: string) =>
  createError(
    ErrorCodes.PROPERTY_NOT_DEFINED,
    `property "${property}" was not defined`,
  );
export const PROPERTY_NOT_DEFINED_WITH_DATA_ERROR = (
  property: string,
  data: any,
) =>
  createError(
    ErrorCodes.PROPERTY_NOT_DEFINED_WITH_DATA,
    `property "${property}" was not defined ${JSON.stringify(data)}`,
  );
export const UNSUPPORTED_OPERATION_KIND_ERROR = (kind: string) =>
  createError(
    ErrorCodes.UNSUPPORTED_OPERATION_KIND,
    `unsupported operation type "${kind}"`,
  );
export const NETWORK_ERROR = (error: any) =>
  createError(ErrorCodes.NETWORK, `Network error: ${JSON.stringify(error)}`);
export const HEX_LENGTH_INVALID_ERROR = () =>
  createError(ErrorCodes.HEX_LENGTH_INVALID, 'Hex String has invalid length');
export const HEX_CHARACTER_INVALID_ERROR = () =>
  createError(
    ErrorCodes.HEX_CHARACTER_INVALID,
    'Hex String has invalid character',
  );
export const NO_OPERATION_ERROR = () =>
  createError(ErrorCodes.NO_OPERATION, 'Empty operations array');
export const METAMASK_UI_BUSY_ERROR = () =>
  createError(ErrorCodes.METAMASK_UI_BUSY, 'MetaMask UI is busy');

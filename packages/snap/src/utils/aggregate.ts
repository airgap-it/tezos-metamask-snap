import BigNumber from 'bignumber.js';

export const aggregate = (array: any[], field: string) => {
  return array
    .reduce((pv, cv): BigNumber => {
      return pv.plus(cv[field]);
    }, new BigNumber(0))
    .toString();
};

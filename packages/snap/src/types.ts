export type Network = 'mainnet' | 'ghostnet' | 'shadownet' | 'custom';

export type SnapStorage = {
  rpc: {
    network: Network;
    nodeUrl: string;
  };
};

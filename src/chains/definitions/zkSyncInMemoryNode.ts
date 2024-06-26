import { defineChain } from '../../utils/chain/defineChain.js'

export const zkSyncInMemoryNode = /*#__PURE__*/ defineChain({
  id: 260,
  name: 'zkSync InMemory Node',
  network: 'zksync-in-memory-node',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['http://localhost:8011'],
    },
  },
  testnet: true,
})

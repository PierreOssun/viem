import { NetworkProvider } from '../../providers/network/createNetworkProvider'
import { WalletProvider } from '../../providers/wallet/createWalletProvider'
import {
  BlockTag,
  Data,
  TransactionResult,
} from '../../types/ethereum-provider'
import { BaseError, numberToHex } from '../../utils'

export type FetchTransactionArgs =
  | {
      blockHash: Data
      blockNumber?: never
      blockTag?: never
      hash?: never
      index: number
    }
  | {
      blockHash?: never
      blockNumber: number
      blockTag?: never
      hash?: never
      index: number
    }
  | {
      blockHash?: never
      blockNumber?: never
      blockTag: BlockTag
      hash?: never
      index: number
    }
  | {
      blockHash?: never
      blockNumber?: never
      blockTag?: never
      hash: Data
      index?: number
    }

export type FetchTransactionResponse = TransactionResult<bigint>

export async function fetchTransaction(
  provider: NetworkProvider | WalletProvider,
  {
    blockHash,
    blockNumber,
    blockTag = 'latest',
    hash,
    index,
  }: FetchTransactionArgs,
): Promise<FetchTransactionResponse> {
  const blockNumberHex =
    blockNumber !== undefined ? numberToHex(blockNumber) : undefined

  let transaction: TransactionResult | null = null
  if (hash) {
    transaction = await provider.request({
      method: 'eth_getTransactionByHash',
      params: [hash],
    })
  } else if (blockHash) {
    transaction = await provider.request({
      method: 'eth_getTransactionByBlockHashAndIndex',
      params: [blockHash, numberToHex(index)],
    })
  } else if (blockNumberHex || blockTag) {
    transaction = await provider.request({
      method: 'eth_getTransactionByBlockNumberAndIndex',
      params: [blockNumberHex || blockTag, numberToHex(index)],
    })
  }

  if (!transaction)
    throw new TransactionNotFoundError({
      blockHash,
      blockNumber,
      blockTag,
      hash,
      index,
    })
  return deserializeTransaction(transaction)
}

///////////////////////////////////////////////////////

// Serializers

export function deserializeTransaction({
  accessList,
  blockHash,
  blockNumber,
  from,
  gas,
  gasPrice,
  hash,
  input,
  maxFeePerGas,
  maxPriorityFeePerGas,
  nonce,
  r,
  s,
  to,
  transactionIndex,
  v,
  value,
}: TransactionResult): TransactionResult<bigint> {
  return {
    accessList,
    blockHash,
    blockNumber: BigInt(blockNumber),
    from,
    gas: BigInt(gas),
    gasPrice: BigInt(gasPrice),
    hash,
    input,
    maxFeePerGas: maxFeePerGas ? BigInt(maxFeePerGas) : undefined,
    maxPriorityFeePerGas: maxPriorityFeePerGas
      ? BigInt(maxPriorityFeePerGas)
      : undefined,
    nonce: BigInt(nonce),
    r,
    s,
    to,
    transactionIndex: BigInt(transactionIndex),
    v: BigInt(v),
    value: BigInt(value),
  }
}

///////////////////////////////////////////////////////

// Errors

export class TransactionNotFoundError extends BaseError {
  name = 'TransactionNotFoundError'
  constructor({
    blockHash,
    blockNumber,
    blockTag,
    hash,
    index,
  }: {
    blockHash?: Data
    blockNumber?: number
    blockTag?: BlockTag
    hash?: Data
    index?: number
  }) {
    let identifier = 'Transaction'
    if (blockHash && index !== undefined)
      identifier = `Transaction at block hash "${blockHash}" at index "${index}"`
    if (blockTag && index !== undefined)
      identifier = `Transaction at block time "${blockTag}" at index "${index}"`
    if (blockNumber && index !== undefined)
      identifier = `Transaction at block number "${blockNumber}" at index "${index}"`
    if (hash) identifier = `Transaction with hash "${hash}"`
    super({
      humanMessage: `${identifier} could not be found.`,
      details: 'transaction not found',
    })
  }
}
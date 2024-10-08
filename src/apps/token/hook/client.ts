import { createWalletClient,createPublicClient, custom, http } from 'viem'
import { baseSepolia } from 'viem/chains'
 
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http()
})
 
export const walletClient = createWalletClient({
  chain: baseSepolia,
  transport: custom(window.ethereum)
})
 
// JSON-RPC Account
export const [account] = await walletClient.getAddresses()
// Local Account

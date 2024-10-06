import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: "LearNova",  // Change this to your app name
      version: '4',  // Specify the version
    }),
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,  // Use the environment variable for project ID
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})

// Optional: If you need SSR support or custom storage
// storage: createStorage({
//   storage: cookieStorage,  // Use cookie storage if needed
// }),

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

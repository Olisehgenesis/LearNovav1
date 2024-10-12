import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia],
  connectors: [
    
    coinbaseWallet({
      appName: "LearNova",
      preference: 'smartWalletOnly',
      version: '4',  // Specify the version
    }),
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,  // Use the environment variable for project ID
    }),
  ],
  transports: {
    [baseSepolia.id]: http(),
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

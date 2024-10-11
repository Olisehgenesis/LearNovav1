import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    
    coinbaseWallet({
      appName: "LearNova",  // Change this to your app name
      version: '4',  // Specify the version
    }),
    injected(),
    walletConnect({
      projectId: import.meta.env.VITE_WC_PROJECT_ID,  // Use the environment variable for project ID
    }),
  ],
  transports: {
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

# 🚀 LearNova

LearNova is an innovative blockchain-based learning platform that combines AI-powered quizzes with token rewards. Currently running on the Base Sepolia testnet, LearNova aims to revolutionize online education by incentivizing learning through cryptocurrency rewards.

## ✨ Features

- 🧠 AI-generated quizzes
- 💰 Blockchain-based reward system using Coinbase Wallet
- 🎓 Interactive learning experiences
- 🪙 Token economy for educational content

## 🛠 Technology Stack

- ⚛️ React with Vite
- 📜 Solidity for smart contracts
- 🔗 Base Sepolia testnet (developed by Coinbase)
- 👛 Coinbase Wallet SDK for account management
- 🔧 Coinbase Onchain Kit
- 🤖 Google AI for quiz generation
- 🗄️ Supabase for database management

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm
- Coinbase Smart Wallet (no need for MetaMask or other external wallets)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Olisehgenesis/LearNovav1.git
   cd LearNovav1
   ```

2. Install dependencies using pnpm:

   ```bash
   pnpm install
   ```

3. Create a `.env` file in the root directory and add the necessary environment variables (see below for required variables).

4. Start the development server:
   ```bash
   pnpm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables (replace with your own values):

```env
VITE_WC_PROJECT_ID=your_wallet_connect_project_id
VITE_ONCHAINKIT_API_KEY=your_onchainkit_api_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

> **Note:** Never share your API keys or include them in public repositories.

## 📜 Smart Contracts

The project uses two main smart contracts:

- Token Contract: `0xD31b5bED7ba6e427BBc9516041CC8B9B3EC13725`
- Quiz Factory Contract: `0x2e026c70E43d76aA00040ECD85601fF47917C157`
- faucet: `0x644851C0E02831537A7e8B3C80e799e06CFdA1ff`

These contracts are currently deployed on the Base Sepolia testnet.

## 🔗 Coinbase and Base Integration

LearNova leverages Coinbase technology for an enhanced user experience:

- **Coinbase Smart Wallet**: Users interact with the platform using Coinbase Wallet, providing a seamless and user-friendly blockchain experience.
- **Coinbase Onchain Kit**: We utilize Coinbase's tools for improved blockchain interactions and development.
- **Future Base Mainnet Integration**: We plan to migrate to the Base mainnet in the future, which will enable features like:
  - Account Abstraction for improved UX
  - Paymaster functionality for potential gasless transactions
  - Base Names for user-friendly wallet addresses

> **Note:** Some Base-specific features are not available in the current Base Sepolia testnet environment.

## 🪙 LNT Token Faucet

To get started with LearNova, you can claim a small amount of LNT tokens from our faucet. These tokens can be used to create quizzes or can be earned by completing quizzes. If the faucet is empty, you can still participate in quizzes to earn tokens.

> Faucet ID can be found on the claim page.

## 🧪 Test the Application

You can test the LearNova application by visiting:

[🔗 https://learnova.on-fleek.app/](https://learnova.on-fleek.app/)

Feel free to explore the features, create quizzes, and earn tokens on our platform!

## 🤝 Contributing

We welcome contributions to LearNova! If you'd like to contribute, please fork the repository and create a pull request with your changes. Here are some areas where contributions would be particularly helpful:

- 👛 Enhancing Coinbase Wallet integration
- 🧠 Improving AI quiz generation capabilities
- 💹 Optimizing the token economy system
- 🧪 Writing tests and improving code quality
- 📚 Documenting features and usage
- 🔗 Preparing for future Base mainnet integration

## 📋 To Do

- [ ] Implement Coinbase Wallet Paymaster functionality for gasless transactions
- [ ] Prepare for migration to Base mainnet
- [ ] Expand AI capabilities for more diverse quiz types
- [ ] Implement a more robust token economy
- [ ] Develop mobile app version

## ⚠️ Disclaimer

This project is currently running on the Base Sepolia testnet. While we aim to move to the Base mainnet in the future, please be aware that some Base-specific features are not available in the current testnet environment.

## 📄 License

MIT Open License

---

For any questions or support, please open an issue in the GitHub repository: [https://github.com/Olisehgenesis/LearNovav1](https://github.com/Olisehgenesis/LearNovav1)

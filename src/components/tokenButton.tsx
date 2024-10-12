import { TokenRow } from "@coinbase/onchainkit/token";
import "@coinbase/onchainkit/styles.css";
import { useQuizToken } from "../apps/token/hook/useQuizToken"; // Adjust the import path as needed

const tokenAddress = "0x270B4190DD62De9fbb48Cd71C6B052f5924d4FcC";

type Token = {
  address: "" | `0x${string}`;
  chainId: number;
  decimals: number;
  image: string;
  name: string;
  symbol: string;
};
const token: Token = {
  address: tokenAddress as `0x${string}`,
  chainId: 1,
  decimals: 18,
  image:
    "https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png",
  name: "",
  symbol: "LNT",
};
interface TokenButtonProps {
  address: string;
}

const TokenButton = ({ address }: TokenButtonProps) => {
  const { userBalance } = useQuizToken();

  console.log("user adress user", address);
  console.log("User Balance", userBalance);

  if (!address || !userBalance) {
    return null;
  }

  return (
    <div>
      <TokenRow token={token} amount={userBalance} hideImage />
    </div>
  );
};

export default TokenButton;

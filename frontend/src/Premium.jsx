import SuperfluidWidget from "@superfluid-finance/widget";
import superTokenList from "@superfluid-finance/tokenlist";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css'

export default function Checkout() {

  const paymentOptions = [
    {
      receiverAddress: '0xaB90fEA2129f39cB3e4EEF24914e77663f670049',
      superToken: {
        address: "0x671425Ae1f272Bc6F79beC3ed5C4b00e9c628240"
      },
      chainId: 42220,
      flowRate: {
        amountEther: "0.01",
        period: "month"
      }
    }
  ];
  const paymentDetails = {
    paymentOptions,
  };
  const productDetails = {
    name: "GO Premium",
    description: "Enjoy Streamverse without ads",
    successURL: "http://localhost:5173",
  };
  const handleButtonClick = () => {
    console.log("clicked");
  };
  return (
    <ConnectButton.Custom onClick={handleButtonClick}>
      {({ openConnectModal, connectModalOpen }) => {
        const walletManager = {
          open: async () => openConnectModal(),
          isOpen: connectModalOpen,
        };
        return (
          <>
            <SuperfluidWidget
              productDetails={productDetails}
              paymentDetails={paymentDetails}
              tokenList={superTokenList}
              type="page"
              walletManager={walletManager}
            >
              {({ openModal }) => (
                <button onClick={() => {
                  handleButtonClick();
                  openModal();
                }}>submit</button>
              )}
            </SuperfluidWidget>
          </>
        );
      }}
    </ConnectButton.Custom>
  );
}
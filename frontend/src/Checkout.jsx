import SuperfluidWidget from "@superfluid-finance/widget";
import superTokenList from "@superfluid-finance/tokenlist";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import '@rainbow-me/rainbowkit/styles.css'

export default function Checkout({ adName }) {

  const paymentOptions = [
    {
      receiverAddress: '0x2910135944f79d2B649209BC580fd9B6e73E82f1',
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
    name: adName,
    description: "This API Greets you",
    successURL: "http://localhost:5173",
  };
  const handleButtonClick = () => {
    // const wallet = address;
    // axios.post("http://localhost:3000/buy", {
    //   adName,
    //   wallet,
    // })
    //   .then((response) => {
    //     console.log(response.data);
    //   })
    //   .catch((error) => {
    //     console.error(error);
    //   });
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
              type="drawer"
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
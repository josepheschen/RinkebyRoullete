//change this to our abi
import CryptoZombiesContract from "../contract_ABI/Roullete.json";
import store from "../redux/store";

//import blockchainInitialized from "../redux/modules/czAppDuck";  // for some unknown reason, the duck doesn't work!
// so use this action type and creator instead

export const BLOCKCHAIN_INITIALIZED = "BLOCKCHAIN_INITIALIZED"; // action type

// action creator (dispatch sends this to redux reducer)
function blockchainInitialized(data) {
  return {
    type: BLOCKCHAIN_INITIALIZED,
    payload: data
  };
}

//
//  set up the blockchain shadow contract, user address, and user zombie count.  Put into redux store.
//

async function initBlockchain(web3) {
  // Use web3 to get the user's accounts.
  const accounts = await web3.eth.getAccounts();
  const userAddress = accounts[0];

  // Get contract instance
  //change to our contract
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = CryptoZombiesContract.networks[networkId];
  const instance = new web3.eth.Contract(
    CryptoZombiesContract.abi,
    deployedNetwork && deployedNetwork.address
  );

  // put state data into the REDUX store for easy access from other pages and components
//change to our contract
  let data = {
    CZ: instance,
    userAddress,    // shorthand
  };

  store.dispatch(blockchainInitialized(data));

  return data;
}

export default initBlockchain;

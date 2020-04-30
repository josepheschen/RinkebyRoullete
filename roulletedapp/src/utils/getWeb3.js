import Web3 from "web3";
import store from "../redux/store";

//import web3Initialized from "../redux/modules/czAppDuck";  // for some unknown reason, the duck doesn't work!
// so use this action type and creator instead

const WEB3_INITIALIZED = 'WEB3_INITIALIZED'; // action type

// action creator
function web3Initialized(results) {
  console.log("action creator", results);
   return {
        type: WEB3_INITIALIZED,
        payload: results
    }
}

//  This module resolves metamask (or other provider) to set up the web3 instance in redux store

const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    var results;
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
        results = {
          web3Instance: web3
        };
        console.log("Injected web3 detected.", results);
        resolve(store.dispatch(web3Initialized(results))); // redux action creator
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log("Injected web3 detected.");
        resolve(web3);
        results = {
          web3Instance: web3
        };
        console.log("legacy Injected web3 detected.");
        resolve(store.dispatch(web3Initialized(results))); // redux action creator
      }
      // Fallback to localhost; use dev console port by default...
      else {
        const provider = new Web3.providers.HttpProvider(
          "http://127.0.0.1:8545"
        );
        const web3 = new Web3(provider);
        resolve(web3);
        results = {
          web3Instance: web3
        };
        console.log("No web3 instance injected, using Local web3.");
        resolve(store.dispatch(web3Initialized(results))); // redux action creator
      }
    });
  });

export default getWeb3;

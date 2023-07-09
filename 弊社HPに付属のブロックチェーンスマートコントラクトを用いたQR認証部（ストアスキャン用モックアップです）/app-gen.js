/*
//------------------------------------------------
//name:Web3QR-demo_ShinCoin(TM)-v1
//
//SPDX-License-Identifier: UNLICENSED
//2023-4-11
//SINGULION Corporation
//CEO Katsuya NISHIZAWA
//https://www.openzeppelin.com/contracts
//https://patentscope2.wipo.int/search/ja/detail.jsf?docId=JP366820626&_cid=JP1-LDO5GB-30888-1
//WEB3-QRコード認証のコード生成部・認証部
//------------------------------------------------
*/

//Creator:0x56E9b43B09291107b153155Bf7942C0e738a57bC//gu^wallet
//contract
const gaContractAddress = "0xE9f6dC8440A4A6Ee4a54727f931174a21c7ab4c1";//動的パスワード生成部認証部

//EOA-nft
let nftId;//otp-token-number or tokenId
let gaInstance; // instance
let myAccount;//user Wallet
nftId = sessionStorage.getItem('nftId') ;//demo-nftid

//動的パスワードVP->totp 
let totp;


//https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider
/*****************************************/
/* Detect the MetaMask GU Ethereum provider */
/*****************************************/
/*
//>>import detectEthereumProvider from '@metamask/detect-provider';
//<script src="https://unpkg.com/@metamask/detect-provider/dist/detect-provider.min.js"></script>
*/

async function getChainData(){
  const hexChainId = await window.ethereum.request({ method: 'eth_chainId' });
  const chainId = parseInt(hexChainId);
  console.log('chain ID is',chainId);
  let hexBlockNumber = await window.ethereum.request({ method: "eth_blockNumber"} );
  let bn = parseInt(hexBlockNumber);
  console.log('latest block number is',bn);
}

async function getUserEoa(){
  try {
    const acccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (acccounts.length > 0) {
      myAccount=acccounts[0];
      console.log('Your Address is ',acccounts[0]);
    }
  } catch (err) {
    if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        console.log('Please connect to MetaMask.');
    } else {
        console.error(err);
    }
}
}

function startApp(provider) {
  // If the provider returned by detectEthereumProvider is not the same as
  // window.ethereum, something is overwriting it, perhaps another wallet.
  if (provider !== window.ethereum) {
    console.error('Do you have multiple wallets installed?');
  }
  // Access the decentralized web
  getChainData();
  getUserEoa();
  getEthersContract();
}

async function getEthersContract(){
// A Web3Provider wraps a standard Web3 provider, which is
// what MetaMask injects as window.ethereum into each page
const ethProvider = new ethers.providers.Web3Provider(window.ethereum)

// MetaMask requires requesting permission to connect users accounts
await ethProvider.send("eth_requestAccounts", []);
// Look up the current block number
let bn = await ethProvider.getBlockNumber();
console.log( 'bn is' , bn );

// The MetaMask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
const signer = ethProvider.getSigner()

//const abiga from abiga.js
// The Contract object
const gaContract = new ethers.Contract(gaContractAddress, abiga, ethProvider);
let nftSymbol = await gaContract.symbol();
console.log('symbol',nftSymbol);

// The Contract is currently connected to the Provider,
// which is read-only. You need to connect to a Signer, so
// that you can pay to send state-changing transactions.
const gaWithSigner = await gaContract.connect(signer);

// call vp/otp reqire(user-EOA)
//function genVp(uint256 tokenId){require(ownerOf(tokenId)==msg.sender);}
/*
let tx = await gaWithSigner.genVp(nftId);
let totp = parseInt(tx);
console.log('vp',totp);
*/

}

async function startEthProv(){

    // this returns the provider, or null if it wasn't detected
    const provider = await detectEthereumProvider();

    if (provider) {
      console.log('detect provider. start app.')
      startApp(provider); // Initialize your app

    } else {
      console.log('Please install MetaMask!');
    }
} 







/*---------------*/


//nftidのVP生成呼出 (生成端末側で表示)
//QRコード描画部

async function dispVp() {
  // Contract
  const ethProvider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = ethProvider.getSigner()
  const gaContract = new ethers.Contract(gaContractAddress, abiga, ethProvider);
  const gaWithSigner = await gaContract.connect(signer);


  //get EOA (auto)
  let myAccount;//user Wallet
  try {
    const acccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (acccounts.length > 0) {
        myAccount=acccounts[0];
        console.log('Your Address is ',acccounts[0]);
      }
    } catch (err) {
      if (err.code === 4001) {
          // EIP-1193 userRejectedRequest error
          console.log('Please connect to MetaMask.');
      } else {
          console.error(err);
      }
    }
  //get nft-id using tokenOfOwnerByIndex().
  let tokenIndex = 0;
  let idbi = await gaWithSigner.tokenOfOwnerByIndex(myAccount,tokenIndex);  
  let nftId =idbi.toNumber();//bigNumber->string or number
  console.log('nft Id' , nftId);
  // get VP(totp)
  let tx = await gaWithSigner.genVp(nftId);
  let totp = parseInt(tx);
  console.log('dispVp',totp);

  console.log('nft Id' , nftId);
  document.getElementById("savedId").innerText ='Token ID:'+nftId;
  console.log('dispVp',totp);
  document.getElementById("savedVp").innerText ='totp code:'+totp;

  //WEB3QR (make qr) 
  let mes= totp + '+' +nftId;
  console.log('QR is' ,mes );
  $(function(){
    var qrtext = mes;
    var utf8qrtext = unescape(encodeURIComponent(qrtext));
    $("#img-qr").html("");
    $("#img-qr").qrcode({text:utf8qrtext}); 
  });
};

/*---------------*/
//run program
startEthProv();
const timer = 2000; 
window.addEventListener('load', (event) => {
  dispVp();
  setInterval('location.reload()',timer);
});






import {ethers} from "./ethers.js"
import {abi, contractAddress} from "./constants.js"

console.log(ethers)

const connectButton = document.getElementById("connect")
const getBalanceButton = document.getElementById("getBalance")
const withdrawButton = document.getElementById("withdraw")
const fundButton = document.getElementById("fund")
connectButton.onclick = connect
getBalanceButton.onclick = getBalance
withdrawButton.onclick = withdraw
fundButton.onclick = fund

async function connect(){
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({method: "eth_requestAccounts"})
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "connected"
    } else {
        connectButton.innerHTML = "install metamask pls"
        console.log("co jes")
    }
}

async function getBalance(){
    if(typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund(){
    const ethAmount = document.getElementById("ethAmount").value
    // jak input to pamietac aby .value !!!!
    console.log(`funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // provider/connection to the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // the account from metamask
        const signer = provider.getSigner()
        // contract that we are interacting with - ABI & ADDRESS
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount)
            })
            // now wait for this tx to be mined
            await listenForTxMine(transactionResponse, provider)
            console.log("done!")
        } catch(error) {
            console.log(error)
        }
    }
}

// this one is purposely not an async function
function listenForTxMine(transactionResponse, provider){
    console.log(`Mining ${transactionResponse.hash}...`)
    // the await keyword from "fund" function waits for Promise, so the order is correct
    return new Promise ((resolve, reject)=>{
        // the reason for cr8ting new promise is that we want to listen to blockchain when the transaction finishes
        provider.once(transactionResponse.hash, (transactionReceipt)=>{
        // .confirmations gives us a number
        console.log(`Completed with ${transactionReceipt.confirmations} confirmations`)
        // we are telling that only once the above is finished, resolve the function
        resolve()
        })
    })
}

async function withdraw(){
    console.log("withdrawing...")
    if(typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTxMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}
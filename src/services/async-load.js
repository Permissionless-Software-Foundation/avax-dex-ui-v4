/*
  This library gets data that requires an async wait.
*/

// Global npm libraries
import axios from 'axios'
import Jdenticon from '@chris.troutner/react-jdenticon'

// Local libraries
import GistServers from './gist-servers'

class AsyncLoad {
  constructor () {
    this.BchWallet = false
    this.AvaxWallet = false
  }

  // Load the minimal-slp-wallet which comes in as a <script> file and is
  // attached to the global 'window' object.
  async loadWalletLib () {
    do {
      if (typeof window !== 'undefined' && window.SlpWallet) {
        this.BchWallet = window.SlpWallet

        return this.BchWallet
      } else {
        console.log('Waiting for wallet library to load...')
      }

      await sleep(1000)
    } while (!this.BchWallet)
  }

  // Initialize the BCH wallet
  async initWallet (restURL, mnemonic, updateBchWalletState) {
    const options = {
      interface: 'consumer-api',
      restURL,
      noUpdate: true
    }

    let wallet
    if (mnemonic) {
      // Load the wallet from the mnemonic, if it's available from local storage.
      wallet = new this.BchWallet(mnemonic, options)
    } else {
      // Generate a new mnemonic and wallet.
      wallet = new this.BchWallet(null, options)
    }

    // Wait for wallet to initialize.
    await wallet.walletInfoPromise

    // Update the state of the wallet.
    updateBchWalletState(wallet.walletInfo)

    // Save the mnemonic to local storage.
    // if (!mnemonic) {
    //   const newMnemonic = wallet.walletInfo.mnemonic
    //
    //   // Update the BCH mnemonic in LocalStorage.
    //   const bchObj = {
    //     bchWallet: {
    //       mnemonic: newMnemonic
    //     }
    //   }
    //   saveLocalStorage(bchObj)
    // }

    this.wallet = wallet

    return wallet
  }

  // Get the spot exchange rate for BCH in USD.
  async getUSDExchangeRate (wallet, updateBchWalletState) {
    const bchUsdPrice = await wallet.getUsd()

    // Update the state of the wallet
    updateBchWalletState({ bchUsdPrice })

    return true
  }

  // Get a list of SLP tokens held by the wallet.
  async getSlpTokenBalances (wallet, updateBchWalletState) {
    // Get token information from the wallet. This will also initialize the UTXO store.
    const slpTokens = await wallet.listTokens(wallet.walletInfo.cashAddress)
    // console.log('slpTokens: ', slpTokens)

    // Add an icon property to each token.
    slpTokens.map(x => {
      x.icon = (<Jdenticon size='100' value={x.tokenId} />)
      x.iconNeedsDownload = true
      return true
    })

    // Update the state of the wallet with the balances
    updateBchWalletState({ slpTokens })

    return true
  }

  // Get the BCH balance of the wallet.
  async getWalletBchBalance (wallet, updateBchWalletState) {
    // Get the BCH balance of the wallet.
    const bchBalance = await wallet.getBalance(wallet.walletInfo.cashAddress)

    // Update the state of the wallet with the balances
    updateBchWalletState({ bchBalance })

    return true
  }

  // Get token data for a given Token ID
  async getTokenData (tokenId) {
    const tokenData = await this.wallet.getTokenData(tokenId)

    // Convert the IPFS CIDs into actual data.
    tokenData.immutableData = await this.getIpfsData(tokenData.immutableData)
    tokenData.mutableData = await this.getIpfsData(tokenData.mutableData)

    return tokenData
  }

  // Get data about a Group token
  async getGroupData (tokenId) {
    const tokenData = await this.getTokenData(tokenId)

    const groupData = {
      immutableData: tokenData.immutableData,
      mutableData: tokenData.mutableData,
      nfts: tokenData.genesisData.nfts,
      tokenId: tokenData.genesisData.tokenId
    }

    return groupData
  }

  // Given an IPFS URI, this will download and parse the JSON data.
  async getIpfsData (ipfsUri) {
    const cid = ipfsUri.slice(7)

    const downloadUrl = `https://${cid}.ipfs.dweb.link/data.json`

    const response = await axios.get(downloadUrl)
    const data = response.data

    return data
  }

  // Get a list of alternative back end servers.
  async getServers () {
    // Try to get the list from GitHub
    try {
      const gistLib = new GistServers()
      const gistServers = await gistLib.getServerList()

      const serversAry = []

      for (let i = 0; i < gistServers.length; i++) {
        serversAry.push({ value: gistServers[i].url, label: gistServers[i].url })
      }

      return serversAry
    } catch (err) {
      console.error('Error trying to retrieve list of servers from GitHub: ', err)
      console.log('Returning hard-coded list of servers.')

      const defaultOptions = [
        { value: 'https://free-bch.fullstack.cash', label: 'https://free-bch.fullstack.cash' },
        { value: 'https://bc01-ca-bch-consumer.fullstackcash.nl', label: 'https://bc01-ca-bch-consumer.fullstackcash.nl' },
        { value: 'https://pdx01-usa-bch-consumer.fullstackcash.nl', label: 'https://pdx01-usa-bch-consumer.fullstackcash.nl' },
        { value: 'https://wa-usa-bch-consumer.fullstackcash.nl', label: 'https://wa-usa-bch-consumer.fullstackcash.nl' }
      ]

      return defaultOptions
    }
  }

  // Load the minimal-avax-wallet which comes in as a <script> file and is
  // attached to the global 'window' object.
  async loadAvaxWalletLib () {
    do {
      if (typeof window !== 'undefined' && window.SlpWallet) {
        this.AvaxWallet = window.AvaxWallet

        return this.AvaxWallet
      } else {
        console.log('Waiting for AVAX wallet library to load...')
      }

      await sleep(1000)
    } while (!this.AvaxWallet)
  }

  // Initialize the BCH wallet
  async initAvaxWallet (mnemonic, updateAvaxWalletState) {
    try {
      const options = {
        noUpdate: true
      }

      // const wallet = new this.AvaxWallet(mnemonic, options)

      let wallet
      if (mnemonic) {
        // Load the wallet from the mnemonic, if it's available from local storage.
        wallet = new this.AvaxWallet(mnemonic, options)
      } else {
        // Generate a new mnemonic and wallet.
        wallet = new this.AvaxWallet(null, options)
      }

      // Wait for wallet to initialize.
      await wallet.walletInfoPromise

      // console.log('AVAX wallet info: ', wallet.walletInfo)

      // Get the AVAX and token balances for the wallet.
      const avaxAddress = wallet.walletInfo.address
      const avaxBalances = await wallet.utxos.getBalance(avaxAddress)
      // console.log('avaxBalances: ', avaxBalances)

      // Add an icon property to each token.
      avaxBalances.map(x => {
        // console.log(`asset: ${JSON.stringify(x, null, 2)}`)

        // Convert asset quantity into its base currency.
        let balance = x.amount
        if (x.denomination) {
          balance = x.amount / Math.pow(10, x.denomination)
        }

        x.icon = (<Jdenticon size='100' value={x.assetID} />)
        x.iconNeedsDownload = true
        x.balance = balance
        return true
      })

      wallet.walletInfo.balances = avaxBalances

      // Update the state of the wallet.
      updateAvaxWalletState(wallet.walletInfo)

      // Save the mnemonic to local storage.
      // if (!mnemonic) {
      //   const newMnemonic = wallet.walletInfo.mnemonic
      //
      //   // Update the BCH mnemonic in LocalStorage.
      //   const avaxObj = {
      //     avaxWallet: {
      //       mnemonic: newMnemonic
      //     }
      //   }
      //   saveLocalStorage(avaxObj)
      // }

      this.wallet = wallet

      return wallet
    } catch (err) {
      console.log('Error while trying to load AVAX wallet: ', err)
      throw new Error('Error while trying to load AVAX wallet. Please refresh the page and try again.')
    }
  }

  // Retrieve the AVAX and BCH wallet mnemonics from the avax-dex server.
  async getMnemonics () {
    const url = 'http://localhost:5700/mnemonic'

    const response = await axios.get(url)
    const data = response.data
    // console.log('data: ', data)

    const avaxMnemonic = data.avaxMnemonic
    const bchMnemonic = data.bchMnemonic

    return { avaxMnemonic, bchMnemonic }
  }
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default AsyncLoad

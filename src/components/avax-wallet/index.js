/*
  This component controlls the Wallet View.
*/

// Global npm libraries
import React from 'react'

// Local Libraries
import WebWalletWarning from './warning'
import WalletSummary from './wallet-summary'
// import WalletClear from './clear-wallet'
// import WalletImport from './import-wallet'

class AvaxWallet extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      appData: props.appData,
      avaxWallet: props.appData.avaxWallet,
      avaxWalletState: props.appData.avaxWalletState
    }
  }

  // <br />
  // <WalletClear delMnemonic={this.state.delMnemonic} />
  // <br />
  // <WalletImport avaxWallet={this.state.avaxWallet} setMnemonic={this.state.setMnemonic} />

  render () {
    return (
      <>
        <WebWalletWarning />
        <br />
        <WalletSummary avaxWallet={this.state.avaxWallet} avaxWalletState={this.state.avaxWalletState} appData={this.state.appData} />
      </>
    )
  }
}

export default AvaxWallet

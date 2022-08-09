/*
  This component displays a summary of the wallet.
*/

// Global npm libraries
import React from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWallet, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { Clipboard } from '@capacitor/clipboard'

// Local libraries
import './wallet-summary.css'
import CopyOnClick from './copy-on-click'

let _this

class WalletSummary extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      avaxWallet: props.avaxWallet,
      avaxWalletState: props.avaxWalletState,
      appData: props.appData,
      blurredMnemonic: true,
      blurredPrivateKey: true
    }

    _this = this
  }

  render () {
    // console.log(`WalletSummary render() this.state.avaxWalletState: ${JSON.stringify(this.state.avaxWalletState, null, 2)}`)

    const eyeIcon = {
      mnemonic: _this.state.blurredMnemonic ? faEyeSlash : faEye,
      privateKey: _this.state.blurredPrivateKey ? faEyeSlash : faEye
    }

    return (
      <>
        <Container>
          <Row>
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title style={{ textAlign: 'center' }}>
                    <h2>
                      <FontAwesomeIcon icon={faWallet} />{' '}
                      <span>My Wallet</span>
                    </h2>
                  </Card.Title>
                  <Container>
                    <Row style={{ padding: '25px' }}>
                      <Col xs={12} sm={10} lg={8} style={{ padding: '10px' }}>
                        <b>Mnemonic:</b> <span className={this.state.blurredMnemonic ? 'blurred' : null}>{this.state.avaxWalletState.mnemonic}</span>
                      </Col>
                      <Col xs={6} sm={1} lg={2} style={{ textAlign: 'center' }}>
                        <FontAwesomeIcon icon={eyeIcon.mnemonic} size='lg' onClick={() => _this.toggleMnemonicBlur()} />
                      </Col>
                      <Col xs={6} sm={1} lg={2} style={{ textAlign: 'center' }}>
                        <CopyOnClick walletProp='mnemonic' appData={this.state.appData} />
                      </Col>
                    </Row>

                    <Row style={{ padding: '25px', backgroundColor: '#eee' }}>
                      <Col xs={12} sm={10} lg={8} style={{ padding: '10px' }}>
                        <b>Private Key:</b> <span className={this.state.blurredPrivateKey ? 'blurred' : null}>{this.state.avaxWalletState.privateKey}</span>
                      </Col>
                      <Col xs={6} sm={1} lg={2} style={{ textAlign: 'center' }}>
                        <FontAwesomeIcon icon={eyeIcon.privateKey} size='lg' onClick={() => _this.togglePrivateKeyBlur()} />
                      </Col>
                      <Col xs={6} sm={1} lg={2} style={{ textAlign: 'center' }}>
                        <CopyOnClick walletProp='privateKey' appData={this.state.appData} />
                      </Col>
                    </Row>

                    <Row style={{ padding: '25px' }}>
                      <Col xs={12} sm={10} lg={8} style={{ padding: '10px' }}>
                        <b>Address:</b> {this.state.avaxWalletState.address}
                      </Col>
                      <Col xs={6} sm={1} lg={2} style={{ textAlign: 'center' }} />
                      <Col xs={6} sm={1} lg={2} style={{ textAlign: 'center' }}>
                        <CopyOnClick walletProp='cashAddress' appData={this.state.appData} />
                      </Col>
                    </Row>
                  </Container>
                </Card.Body>
              </Card>

            </Col>
          </Row>
        </Container>
      </>
    )
  }

  toggleMnemonicBlur () {
    this.setState({
      blurredMnemonic: !_this.state.blurredMnemonic
    })
  }

  togglePrivateKeyBlur () {
    this.setState({
      blurredPrivateKey: !_this.state.blurredPrivateKey
    })
  }

  async copyToClipboard (key) {
    // console.log('copyToClipboard() key: ', key)

    const val = _this.state.avaxWalletState[key]
    // console.log(`value copied to clipboard: ${val}`)

    try {
      // Capacitor Android environment.

      // Write the value to the clipboard.
      await Clipboard.write({
        string: val
      })
    } catch (err) {
      // Browser environment. Use normal browser methods.

      const textArea = document.createElement('textarea')
      textArea.value = val
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('Copy')
      textArea.remove()
    }
  }
}

export default WalletSummary

/*
  This component renders as a button. When clicked, it opens up a modal
  for sending a quantity of tokens.
  This component requires state, because it's a complex form that is being manipulated
  by the user.
*/

// Global npm libraries
import React from 'react'
import { Button, Modal, Container, Row, Col, Form, Spinner } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSackDollar } from '@fortawesome/free-solid-svg-icons'
import { Clipboard } from '@capacitor/clipboard'
import axios from 'axios'

// Local libraries
import config from '../../config'

// let _this

class SellTokenButton extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      token: props.token,
      appData: props.appData,

      // Function from parent View component. Called after sending tokens,
      // to trigger a refresh of the wallet token balances.
      refreshTokens: props.refreshTokens,

      // Modal control
      showModal: false,
      statusMsg: '',
      hideSpinner: true,
      shouldRefreshOnModalClose: false,

      // Modal inputs
      sendToAddress: '',
      sendQtyStr: '',
      sendQtyNum: 0,
      pricePerTokenStr: ''
    }

    this.handleSellTokens = this.handleSellTokens.bind(this)

    // _this = this
  }

  render () {
    // Generate the JSX for the modal.
    const modal = this.getModal()

    return (
      <>
        <Button variant='info' onClick={(e) => this.handleShowModal()}>Sell</Button>
        {
          this.state.showModal
            ? modal
            : null
        }
      </>
    )
  }

  // Toggle the Info modal.
  handleShowModal () {
    this.setState({
      showModal: true
    })
  }

  // This handler function is called when the modal is closed.
  async handleCloseModal (instance) {
    // console.log(`Refreshing tokens: ${instance.state.shouldRefreshOnModalClose}`)

    if (instance.state.shouldRefreshOnModalClose) {
      // Refresh the token balance on modal close.

      instance.setState({
        showModal: false,
        shouldRefreshOnModalClose: false,
        statusMsg: ''
      })

      await instance.state.refreshTokens()
    } else {
      // Default behavior

      instance.setState({
        showModal: false,
        statusMsg: ''
      })
    }
  }

  // Generate the info modal that is displayed when the button is clicked.
  getModal () {
    const token = this.state.token
    // console.log(`token: ${JSON.stringify(token, null, 2)}`)

    return (
      <Modal show={this.state.showModal} size='lg' onHide={(e) => this.handleCloseModal(this)}>
        <Modal.Header closeButton>
          <Modal.Title><FontAwesomeIcon icon={faSackDollar} size='lg' /> Sell Tokens: <span style={{ color: 'red' }}>{token.ticker}</span></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Row>
              <Col xs={4}><b>Asset ID:</b></Col>
              <Col xs={8} style={{ wordBreak: 'break-all' }}>{this.state.token.assetID}</Col>
            </Row>
            <br />

            <Row>
              <Col xs={4}><b>Symbol:</b></Col>
              <Col xs={8} style={{ wordBreak: 'break-all' }}>{this.state.token.symbol}</Col>
            </Row>
            <br />

            <Row>
              <Col xs={4}><b>Balance:</b></Col>
              <Col xs={8} style={{ wordBreak: 'break-all' }}>{this.state.token.balance}</Col>
            </Row>
            <br />

            <Row>
              <Col style={{ textAlign: 'center' }}>
                <b>Sell Quantity:</b>
              </Col>
            </Row>

            <Row>
              <Col xs={10}>
                <Form style={{ paddingBottom: '10px' }}>
                  <Form.Group style={{ textAlign: 'center' }}>
                    <Form.Control
                      type='text'
                      onChange={e => this.setState({ sendQtyStr: e.target.value })}
                      value={this.state.sendQtyStr}
                    />
                  </Form.Group>
                </Form>
              </Col>

              <Col xs={2}>
                <Button onClick={(e) => this.handleGetMax()}>Max</Button>
              </Col>
            </Row>
            <br />

            <Row>
              <Col style={{ textAlign: 'center' }}>
                <b>Price per Token (USD):</b>
              </Col>
            </Row>

            <Row>
              <Col xs={12}>
                <Form style={{ paddingBottom: '10px' }}>
                  <Form.Group style={{ textAlign: 'center' }}>
                    <Form.Control
                      type='text'
                      onChange={e => this.setState({ pricePerTokenStr: e.target.value })}
                      value={this.state.pricePerTokenStr}
                    />
                  </Form.Group>
                </Form>
              </Col>
            </Row>
            <br />

            <Row>
              <Col style={{ textAlign: 'center' }}>
                <Button onClick={(e) => this.handleSellTokens(this)}>Sell</Button>
              </Col>
            </Row>
            <br />

            <Row>
              <Col xs={10}>
                {this.state.statusMsg}
              </Col>

              <Col xs={2}>
                {this.state.hideSpinner ? null : <Spinner animation='border' />}
              </Col>
            </Row>

          </Container>
        </Modal.Body>
        <Modal.Footer />
      </Modal>
    )
  }

  // This handler is called when the user clicks on the paste-icon favicon,
  // in order to paste an address from the clipboard. This is only functional
  // on Android devices. In the web browser, reading the clipboard requires
  // special permissions, so nothing happens in that context.
  async pasteFromClipboard (event) {
    try {
      // Capacitor Android app takes this code path.

      // Get the value from the clipboard.
      const { value } = await Clipboard.read()
      // console.log('value: ', value)

      // Set the value of the form.
      this.setState({ sendToAddress: value })
    } catch (err) {
      // Browser implementation. Exit quietly.
    }
  }

  // Click handler that fires when the user clicks the Max button.
  handleGetMax () {
    console.log('get max button clicked.')

    // const token = instance.state.token
    // console.log('token: ', token)

    this.setState({
      sendQtyStr: this.state.token.qty
    })
  }

  // Click handler that fires when the user clicks the 'Send' button.
  async handleSellTokens () {
    console.log('Sell button clicked.')

    try {
      this.setState({
        statusMsg: 'Preparing to sell tokens...',
        hideSpinner: false
      })

      // const wallet = this.state.appData.avaxWallet
      // const bchjs = wallet.bchjs
      const token = this.state.token

      // Validate the quantity input
      let qty = this.state.sendQtyStr
      qty = parseFloat(qty)
      if (isNaN(qty) || qty <= 0) throw new Error('Invalid send quantity')

      if (qty > token.balance) {
        throw new Error('Sell quantity is greater than your current balance.')
      }

      // Update the wallets UTXOs
      let infoStr = 'Getting AVAX spot price...'
      console.log(infoStr)
      this.setState({ statusMsg: infoStr })

      // const avaxPrice = await wallet.getUsd()
      const request = await axios.get(`${config.server}/mnemonic/price`)
      const avaxSpotPrice = request.data.usd
      console.log('avaxSpotPrice: ', avaxSpotPrice)

      // Validate the price-per-token input.
      let pricePerToken = this.state.pricePerTokenStr
      pricePerToken = parseFloat(pricePerToken)
      if (isNaN(pricePerToken) || pricePerToken <= 0) throw new Error('Invalid price per token')

      // Calculate the other fields.
      const avaxPerToken = pricePerToken / avaxSpotPrice
      console.log('avaxPerToken: ', avaxPerToken)
      const nAvaxPerToken = Math.floor(avaxPerToken * Math.pow(10, 9))
      console.log('nAvaxPerToken: ', nAvaxPerToken)

      // Construct object
      const order = {
        lokadId: 'SWP',
        messageType: 1,
        messageClass: 1,
        tokenId: this.state.token.assetID,
        buyOrSell: 'sell',
        rateInSats: nAvaxPerToken,
        minSatsToExchange: nAvaxPerToken,
        numTokens: qty
      }

      infoStr = 'Submitting order to avax-dex API (this can take a minute)...'
      console.log(infoStr)
      this.setState({ statusMsg: infoStr })

      const options = {
        method: 'post',
        url: `${config.server}/order`,
        data: { order }
      }
      const result = await axios(options)
      // console.log('result.data: ', result.data)

      const p2wdbHash = result.data.hash

      this.setState({
        statusMsg: (<p><b>Success!</b> Offer Created and updated to <a href={`https://p2wdb.fullstack.cash/entry/hash/${p2wdbHash}`} target='_blank' rel='noreferrer'>P2WDB</a>!</p>),
        hideSpinner: true,
        sendQtyStr: '',
        pricePerTokenStr: '',
        shouldRefreshOnModalClose: true
      })
    } catch (err) {
      console.error('Error in handleSendTokens(): ', err)

      this.setState({
        statusMsg: `Error selling tokens: ${err.message}`,
        hideSpinner: true
      })
    }
  }
}

export default SellTokenButton

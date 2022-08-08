/*
  This React components downloads the active Offers from the REST API and
  displays them in a data table.
*/

// Global npm libraries
import React from 'react'
import { Container, Row, Col, Table, Button } from 'react-bootstrap'
import axios from 'axios'
import { DatatableWrapper, TableBody, TableHeader } from 'react-bs-datatable'

// Local libraries
import config from '../../config'

// Global variables and constants
const SERVER = `${config.server}/`
// let _this

const TABLE_HEADERS = [
  {
    prop: 'symbol',
    title: 'Symbol',
    isFilterable: true
  },
  {
    prop: 'tokenId',
    title: 'Token ID'
  },
  {
    prop: 'buyOrSell',
    title: 'Type'
  },
  {
    prop: 'p2wdbHash',
    title: 'P2WDB ID'
  },
  {
    prop: 'numTokens',
    title: 'Quantity'
  },
  {
    prop: 'rateInSats',
    title: 'nAVAX Each'
  },
  {
    prop: 'button',
    title: 'Action'
  }
]

class Offers extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      balance: '',
      textInput: '',
      // wallet: props.wallet,
      appData: props.appData,
      offers: []
    }

    // _this = this
  }

  render () {
    // console.log(`Rendering with this offer data: ${JSON.stringify(this.state.offers, null, 2)}`)

    return (

      <>
        <Container>
          <Row>
            <Col className='text-break' style={{ textAlign: 'center' }}>
              <DatatableWrapper body={this.state.offers} headers={TABLE_HEADERS}>
                <Table>
                  <TableHeader />
                  <TableBody />
                </Table>
              </DatatableWrapper>
            </Col>
          </Row>
        </Container>
      </>
    )
  }

  // Executes when the component mounts.
  async componentDidMount () {
    // Retrieve initial offer data
    this.handleOffers()

    // Get data and update the table periodically.
    setInterval(() => {
      this.handleOffers()
    }, 30000)
  }

  // Get Offer data and manipulate it for the sake of presentation.
  async handleOffers () {
    // Get raw offer data.
    const offerRawData = await this.getOffers()
    // console.log(`offers: ${JSON.stringify(offers, null, 2)}`)

    // Formatted Data
    const offers = []

    for (let i = 0; i < offerRawData.length; i++) {
      const thisOffer = offerRawData[i]
      console.log(`thisOffer: ${JSON.stringify(thisOffer, null, 2)}`)

      // Get and format the token ID
      const tokenId = thisOffer.tokenId
      const smallTokenId = this.cutString(tokenId)
      thisOffer.tokenId = (<a href={`https://explorer-xp.avax.network/asset/${tokenId}`} target='_blank' rel='noreferrer'>{smallTokenId}</a>)

      // Get and format the P2WDB ID
      const p2wdbHash = thisOffer.p2wdbHash
      const smallP2wdbHash = this.cutString(p2wdbHash)

      thisOffer.button = (<Button text='Buy' variant='success' size='lg' id={p2wdbHash} onClick={this.handleBuy}>Buy</Button>)

      thisOffer.p2wdbHash = (<a href={`https://p2wdb.fullstack.cash/entry/hash/${p2wdbHash}`} target='_blank' rel='noreferrer'>{smallP2wdbHash}</a>)

      offers.push(thisOffer)
    }

    this.setState({
      offers
    })
  }

  async handleBuy (event) {
    console.log('Buy button clicked. Event: ', event)
    const targetOffer = event.target.id
    console.log('targetOffer: ', targetOffer)

    const options = {
      method: 'post',
      url: `${SERVER}offer/take`,
      data: {
        offerP2wdbId: targetOffer
      }
    }

    const result = await axios.request(options)
    console.log('result.data: ', result.data)
  }

  // REST request to get data from avax-dex
  async getOffers () {
    try {
      const options = {
        method: 'GET',
        url: `${SERVER}offer/list/`,
        data: {}
      }
      const result = await axios.request(options)

      return result.data
    } catch (err) {
      console.warn('Error in getOffers() ', err)
    }
  }

  // Given a large string, it will return a string with the first and last
  // four characters.
  cutString (str) {
    try {
      const subTxid = str.slice(0, 4)
      const subTxid2 = str.slice(-4)
      return `${subTxid}...${subTxid2}`
    } catch (err) {
      console.warn('Error in cutString() ', err)
    }
  }
}

export default Offers

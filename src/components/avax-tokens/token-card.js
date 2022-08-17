/*
  This Card component summarizes an SLP token.
*/

// Global npm libraries
import React from 'react'
import { Container, Row, Col, Card } from 'react-bootstrap'

// Local libraries
import InfoButton from './info-button'
// import SendTokenButton from './send-token-button'
import SellTokenButton from './sell-token-button'

const AVAX_ASSET_ID = 'FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z'

function TokenCard (props) {
  // console.log('TokenCard props.token: ', props.token)

  return (
    <>
      <Col xs={12} sm={6} lg={4} style={{ padding: '25px' }}>
        <Card>
          <Card.Body style={{ textAlign: 'center' }}>
            {
              props.token.icon
            }
            <Card.Title style={{ textAlign: 'center' }}>
              <h4>{props.token.symbol}</h4>
            </Card.Title>

            <Container>
              <Row>
                <Col>
                  {props.token.name}
                </Col>
              </Row>
              <br />

              <Row>
                <Col>Balance:</Col>
                <Col>{props.token.balance}</Col>
              </Row>
              <br />

              <Row>
                <Col>
                  <InfoButton token={props.token} />
                </Col>
                <Col>
                  {/*
                  <SendTokenButton
                    token={props.token}
                    appData={props.appData}
                    refreshTokens={props.refreshTokens}
                  />
                  */}
                </Col>
                {
                  (props.token.assetID !== AVAX_ASSET_ID)
                    ? (
                      <Col>
                        <SellTokenButton
                          token={props.token}
                          appData={props.appData}
                          refreshTokens={props.refreshTokens}
                        />
                      </Col>)
                    : null
                }

              </Row>
            </Container>
          </Card.Body>
        </Card>
      </Col>
    </>
  )
}

export default TokenCard

/*
  Load <script> libraries
*/

import useScript from '../hooks/use-script'

function LoadScripts () {
  // useScript('https://unpkg.com/minimal-slp-wallet')
  // useScript('https://unpkg.com/minimal-avax-wallet')

  // Load the libraries from the local directory.
  useScript(`${process.env.PUBLIC_URL}/minimal-slp-wallet.min.js`)
  useScript(`${process.env.PUBLIC_URL}/minimal-avax-wallet.min.js`)

  return true
}

export default LoadScripts

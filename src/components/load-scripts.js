/*
  Load <script> libraries
*/

import useScript from '../hooks/use-script'

function LoadScripts () {
  useScript('https://unpkg.com/minimal-slp-wallet')
  useScript('https://unpkg.com/minimal-avax-wallet')

  return true
}

export default LoadScripts

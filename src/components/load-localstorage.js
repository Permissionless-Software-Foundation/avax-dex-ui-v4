/*
  Load data from LocalStorage
  This is a round-about way of loading the 'use-local-storage-state'
*/

// Global npm libraries
import useLocalStorageState from 'use-local-storage-state'

function LoadLocalStorage (props) {
  const [avaxDexLocalStorage, setAvaxDexLocalStorage, { removeItem }] = useLocalStorageState('avax-dex', {
    ssr: true,
    defaultValue: undefined
  })

  console.log('LocalLocalStorage() loaded data from LocalStorage.')

  // This function is used to pass the mnemonic up to the parent component.
  const passLocalStorage = props.passLocalStorage

  // Pass the result up to the parent component.
  passLocalStorage(avaxDexLocalStorage, setAvaxDexLocalStorage, removeItem)

  return true
}

export default LoadLocalStorage

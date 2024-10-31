import { useState } from 'react'
import * as lnd from './lnd'
import './App.css'

function App() {
  // State for data
  const [info, setInfo] = useState(null)
  const [channels, setChannels] = useState(null)
  const [invoices, setInvoices] = useState(null)
  const [payments, setPayments] = useState(null)
  const [peers, setPeers] = useState(null)
  const [walletInfo, setWalletInfo] = useState(null)

  // Form states
  const [openChannelForm, setOpenChannelForm] = useState({ nodePubkey: '', localFundingAmount: '' })
  const [closeChannelForm, setCloseChannelForm] = useState({ channelPoint: '', force: false })
  const [invoiceForm, setInvoiceForm] = useState({ amount: '' })
  const [paymentForm, setPaymentForm] = useState({ paymentRequest: '' })
  const [peerForm, setPeerForm] = useState({ pubkey: '', host: '' })
  const [sendCoinsForm, setSendCoinsForm] = useState({ addr: '', amount: '', satPerVbyte: '' })
  const [lookupInvoiceForm, setLookupInvoiceForm] = useState({ rHash: '' })

  // Specific handlers for different operations
  const handleGetInfo = async () => {
    try {
      const result = await lnd.getInfo()
      setInfo(result)
      alert(`Node alias: ${result.alias}\nPubkey: ${result.identity_pubkey}`)
    } catch (error) {
      alert(`Error getting info: ${error.message}`)
    }
  }

  const handleListChannels = async () => {
    try {
      const result = await lnd.listChannels()
      setChannels(result)
      alert(`Found ${result.channels?.length || 0} channels`)
    } catch (error) {
      alert(`Error listing channels: ${error.message}`)
    }
  }

  const handleOpenChannel = async (formData) => {
    try {
      const result = await lnd.openChannel(formData)
      alert(`Channel opening initiated!\nFunding txid: ${result.funding_txid}`)
    } catch (error) {
      alert(`Error opening channel: ${error.message}`)
    }
  }

  const handleCreateInvoice = async (amount) => {
    try {
      const result = await lnd.addInvoice(parseInt(amount))
      alert(`Invoice created!\nPayment request: ${result.payment_request}`)
    } catch (error) {
      alert(`Error creating invoice: ${error.message}`)
    }
  }

  const handleListInvoices = async () => {
    try {
      const result = await lnd.listInvoices()
      setInvoices(result)
      alert(`Found ${result.invoices?.length || 0} invoices`)
    } catch (error) {
      alert(`Error listing invoices: ${error.message}`)
    }
  }

  const handlePayInvoice = async (paymentRequest) => {
    try {
      const result = await lnd.payInvoice(paymentRequest)
      alert(`Payment sent!\nPayment hash: ${result.payment_hash}`)
    } catch (error) {
      alert(`Error paying invoice: ${error.message}`)
    }
  }

  // Payment handlers
  const handleListPayments = async () => {
    try {
      const result = await lnd.listPayments()
      setPayments(result)
      alert(`Found ${result.payments?.length || 0} payments`)
    } catch (error) {
      alert(`Error listing payments: ${error.message}`)
    }
  }

  // Peer handlers
  const handleListPeers = async () => {
    try {
      const result = await lnd.listPeers()
      setPeers(result)
      alert(`Found ${result.peers?.length || 0} connected peers`)
    } catch (error) {
      alert(`Error listing peers: ${error.message}`)
    }
  }

  const handleConnectPeer = async (formData) => {
    try {
      await lnd.connectPeer(formData)
      alert(`Successfully connected to peer ${formData.pubkey}`)
    } catch (error) {
      alert(`Error connecting to peer: ${error.message}`)
    }
  }

  const handleDisconnectPeer = async (pubKey) => {
    try {
      await lnd.disconnectPeer(pubKey)
      alert(`Successfully disconnected from peer ${pubKey}`)
    } catch (error) {
      alert(`Error disconnecting peer: ${error.message}`)
    }
  }

  // Wallet handlers
  const handleWalletBalance = async () => {
    try {
      const result = await lnd.walletBalance()
      setWalletInfo(result)
      alert(`Total balance: ${result.total_balance} sats\nConfirmed: ${result.confirmed_balance} sats`)
    } catch (error) {
      alert(`Error getting wallet balance: ${error.message}`)
    }
  }

  const handleGetTransactions = async () => {
    try {
      const result = await lnd.getTransactions()
      setWalletInfo(prev => ({ ...prev, transactions: result }))
      alert(`Found ${result.transactions?.length || 0} transactions`)
    } catch (error) {
      alert(`Error getting transactions: ${error.message}`)
    }
  }

  const handleNewAddress = async () => {
    try {
      const result = await lnd.newAddress()
      alert(`New address generated: ${result.address}`)
    } catch (error) {
      alert(`Error generating address: ${error.message}`)
    }
  }

  const handleSendCoins = async (formData) => {
    try {
      const result = await lnd.sendCoins(formData)
      alert(`Transaction sent!\nTxid: ${result.txid}`)
    } catch (error) {
      alert(`Error sending coins: ${error.message}`)
    }
  }

  const handleCloseChannel = async (formData) => {
    try {
      await lnd.closeChannel(formData)
      alert(`Channel closing initiated!\nChannel point: ${formData.channelPoint}`)
    } catch (error) {
      alert(`Error closing channel: ${error.message}`)
    }
  }

  const handleLookupInvoice = async (rHash) => {
    try {
      const result = await lnd.lookupInvoice(rHash)
      alert(`Invoice found!\nValue: ${result.value} sats\nSettled: ${result.settled ? 'Yes' : 'No'}`)
    } catch (error) {
      alert(`Error looking up invoice: ${error.message}`)
    }
  }

  return (
    <div className="container">
      {/* Info Section */}
      <section>
        <h2>Node Info</h2>
        <button onClick={handleGetInfo}>
          {info ? 'Refresh Info' : 'Get Info'}
        </button>
        {info && <pre>{JSON.stringify(info, null, 2)}</pre>}
      </section>

      {/* Channels Section */}
      <section>
        <h2>Channels</h2>
        <button onClick={handleListChannels}>
          List Channels
        </button>
        
        <h3>Open Channel</h3>
        <form onSubmit={async (e) => {
          e.preventDefault()
          await handleOpenChannel(openChannelForm)
        }}>
          <input
            placeholder="Node Pubkey"
            value={openChannelForm.nodePubkey}
            onChange={e => setOpenChannelForm({...openChannelForm, nodePubkey: e.target.value})}
          />
          <input
            type="number"
            placeholder="Amount (sats)"
            value={openChannelForm.localFundingAmount}
            onChange={e => setOpenChannelForm({...openChannelForm, localFundingAmount: e.target.value})}
          />
          <button type="submit">Open Channel</button>
        </form>

        <h3>Close Channel</h3>
        <form onSubmit={async (e) => {
          e.preventDefault()
          await handleCloseChannel(closeChannelForm)
        }}>
          <input
            placeholder="Channel Point (txid:output_index)"
            value={closeChannelForm.channelPoint}
            onChange={e => setCloseChannelForm({...closeChannelForm, channelPoint: e.target.value})}
          />
          <label>
            <input
              type="checkbox"
              checked={closeChannelForm.force}
              onChange={e => setCloseChannelForm({...closeChannelForm, force: e.target.checked})}
            />
            Force Close
          </label>
          <button type="submit">Close Channel</button>
        </form>

        {channels?.channels && (
          <div>
            <h3>Your Channels</h3>
            {channels.channels.map(channel => (
              <div key={channel.channel_point}>
                <p>Remote Pubkey: {channel.remote_pubkey}</p>
                <p>txid:output_index: {channel.channel_point}</p>
                <p>Capacity: {channel.capacity} sats</p>
                <p>Active: {channel.active ? 'Yes' : 'No'}</p>
                <button 
                  onClick={() => handleCloseChannel({
                    channelPoint: channel.channel_point,
                    force: false
                  })}
                >
                  Close Channel
                </button>
              </div>
            ))}
          </div>
        )}

        {channels && <pre>{JSON.stringify(channels, null, 2)}</pre>}
      </section>

      {/* Invoices Section */}
      <section>
        <h2>Invoices</h2>
        <button onClick={handleListInvoices}>
          List Invoices
        </button>

        <h3>Create Invoice</h3>
        <form onSubmit={async (e) => {
          e.preventDefault()
          await handleCreateInvoice(invoiceForm.amount)
        }}>
          <input
            type="number"
            placeholder="Amount (sats)"
            value={invoiceForm.amount}
            onChange={e => setInvoiceForm({...invoiceForm, amount: e.target.value})}
          />
          <button type="submit">Create Invoice</button>
        </form>

        <h3>Lookup Invoice</h3>
        <form onSubmit={async (e) => {
          e.preventDefault()
          await handleLookupInvoice(lookupInvoiceForm.rHash)
        }}>
          <input
            placeholder="Payment Hash"
            value={lookupInvoiceForm.rHash}
            onChange={e => setLookupInvoiceForm({...lookupInvoiceForm, rHash: e.target.value})}
          />
          <button type="submit">Lookup Invoice</button>
        </form>

        {invoices && <pre>{JSON.stringify(invoices, null, 2)}</pre>}
      </section>

      {/* Payments Section */}
      <section>
        <h2>Payments</h2>
        <button onClick={handleListPayments}>List Payments</button>

        <h3>Pay Invoice</h3>
        <form onSubmit={async (e) => {
          e.preventDefault()
          await handlePayInvoice(paymentForm.paymentRequest)
        }}>
          <input
            placeholder="Payment Request"
            value={paymentForm.paymentRequest}
            onChange={e => setPaymentForm({...paymentForm, paymentRequest: e.target.value})}
          />
          <button type="submit">Pay Invoice</button>
        </form>
        {payments && <pre>{JSON.stringify(payments, null, 2)}</pre>}
      </section>

      {/* Peers Section */}
      <section>
        <h2>Peers</h2>
        <button onClick={handleListPeers}>List Peers</button>

        <h3>Connect to Peer</h3>
        <form onSubmit={async (e) => {
          e.preventDefault()
          await handleConnectPeer(peerForm)
        }}>
          <input
            placeholder="Pubkey"
            value={peerForm.pubkey}
            onChange={e => setPeerForm({...peerForm, pubkey: e.target.value})}
          />
          <input
            placeholder="Host"
            value={peerForm.host}
            onChange={e => setPeerForm({...peerForm, host: e.target.value})}
          />
          <button type="submit">Connect</button>
        </form>

        {peers?.peers && (
          <div>
            <h3>Connected Peers</h3>
            {peers.peers.map(peer => (
              <div key={peer.pub_key}>
                <span>{peer.pub_key}</span>
                <button onClick={() => handleDisconnectPeer(peer.pub_key)}>
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Wallet Section */}
      <section>
        <h2>Wallet</h2>
        <button onClick={handleWalletBalance}>Get Balance</button>
        <button onClick={handleGetTransactions}>List Transactions</button>
        <button onClick={handleNewAddress}>Generate New Address</button>

        <h3>Send Coins</h3>
        <form onSubmit={async (e) => {
          e.preventDefault()
          await handleSendCoins(sendCoinsForm)
        }}>
          <input
            placeholder="Bitcoin Address"
            value={sendCoinsForm.addr}
            onChange={e => setSendCoinsForm({...sendCoinsForm, addr: e.target.value})}
          />
          <input
            type="number"
            placeholder="Amount (sats)"
            value={sendCoinsForm.amount}
            onChange={e => setSendCoinsForm({...sendCoinsForm, amount: e.target.value})}
          />
          <input
            type="number"
            placeholder="Sats/vByte (optional)"
            value={sendCoinsForm.satPerVbyte}
            onChange={e => setSendCoinsForm({...sendCoinsForm, satPerVbyte: e.target.value})}
          />
          <button type="submit">Send</button>
        </form>

        {walletInfo && (
          <>
            <h3>Wallet Info</h3>
            <pre>{JSON.stringify(walletInfo, null, 2)}</pre>
          </>
        )}
      </section>
    </div>
  )
}

export default App

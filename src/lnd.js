import axios from "axios";

// Environment variables for LND connection
const MACAROON = import.meta.env.VITE_MACAROON;
const HOST = import.meta.env.VITE_VOLTAGE_HOST;

// Create an axios instance for LND API calls
const lnd = axios.create({
   baseURL: `https://${HOST}:8080`,
   headers: {
      "Content-Type": "application/json",
      "Grpc-Metadata-Macaroon": MACAROON,
   },
});

// INFO METHODS

export const getInfo = async () => {
   try {
      const response = await lnd.get("/v1/getinfo");
      console.log('GetInfo Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error fetching LND info:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
};

// CHANNEL METHODS

export const listChannels = async () => {
   try {
      const response = await lnd.get("/v1/channels");
      console.log('ListChannels Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error fetching channels:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

export const openChannel = async ({ nodePubkey, localFundingAmount }) => {
   try {
      // Opens a new channel to a node with the specified funding amount
      const response = await lnd.post("/v1/channels", {
         node_pubkey_string: nodePubkey,
         local_funding_amount: localFundingAmount,
         // You can add more options like:
         // private: true, // for private channels
         // push_sat: 0, // amount to push to remote party
      });
      console.log('OpenChannel Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error opening channel:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

export const closeChannel = async ({ channelPoint, force = false }) => {
   try {
      // Closes the specified channel. The channel point format is: txid:output_index
      const [fundingTxId, outputIndex] = channelPoint.split(':');
      const response = await lnd.delete(
         `/v1/channels/${fundingTxId}/${outputIndex}`,
         { data: { force } }
      );
      console.log('CloseChannel Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error closing channel:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

// INVOICE METHODS

export const listInvoices = async () => {
   try {
      // Returns a list of all invoices from the node
      const response = await lnd.get("/v1/invoices");
      console.log('ListInvoices Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error listing invoices:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

export const lookupInvoice = async (rHashStr) => {
   try {
      // Convert from base64 to hex if needed
      const isBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(rHashStr);
      const hexHash = isBase64 
         ? Array.from(atob(rHashStr), c => c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
         : rHashStr;

      const response = await lnd.get(`/v1/invoice/${hexHash}`);
      console.log('LookupInvoice Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error looking up invoice:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

export const addInvoice = async (amount) => {
   try {
      const response = await lnd.post("/v1/invoices", {
         value: amount,
      });
      console.log('AddInvoice Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error creating invoice:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
};

// PAYMENT METHODS

export const listPayments = async () => {
   try {
      // Returns a list of all outgoing payments
      const response = await lnd.get("/v1/payments");
      console.log('ListPayments Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error listing payments:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

export const payInvoice = async (paymentRequest) => {
   try {
      const response = await lnd.post("/v1/channels/transactions", {
         payment_request: paymentRequest,
         // you should set this to prevent getting fee sniped / siphoned!
         fee_limit: {
            fixed: 1000,
         },
      });
      console.log('PayInvoice Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error paying invoice:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
};

// ONCHAIN METHODS

export const walletBalance = async () => {
   try {
      // Returns total unspent outputs (confirmed and unconfirmed)
      const response = await lnd.get("/v1/balance/blockchain");
      console.log('WalletBalance Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error fetching wallet balance:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

export const getTransactions = async () => {
   try {
      // Returns a list of on-chain transactions from the wallet
      const response = await lnd.get("/v1/transactions");
      console.log('GetTransactions Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error fetching transactions:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

export const newAddress = async (type = "WITNESS_PUBKEY_HASH") => {
   try {
      // Generates a new address. Types: WITNESS_PUBKEY_HASH, NESTED_PUBKEY_HASH, UNUSED_WITNESS_PUBKEY_HASH
      const response = await lnd.get("/v1/newaddress", {
         params: { type }
      });
      console.log('NewAddress Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error generating new address:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

export const sendCoins = async ({ addr, amount, satPerVbyte }) => {
   try {
      const response = await lnd.post("/v1/transactions", {
         addr,
         amount,
         sat_per_vbyte: satPerVbyte,
      });
      console.log('SendCoins Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error sending coins:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

// PEER METHODS

export const listPeers = async () => {
   try {
      // Returns a list of all active peers
      const response = await lnd.get("/v1/peers");
      console.log('ListPeers Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error listing peers:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

export const connectPeer = async ({ pubkey, host }) => {
   try {
      // Attempts to establish a connection to a remote peer
      const response = await lnd.post("/v1/peers", {
         addr: {
            pubkey,
            host,
         },
         perm: false, // Optional: permanent peer
      });
      console.log('ConnectPeer Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error connecting to peer:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

export const disconnectPeer = async (pubKey) => {
   try {
      // Disconnects from a connected peer
      const response = await lnd.delete(`/v1/peers/${pubKey}`);
      console.log('DisconnectPeer Response:', JSON.stringify(response.data, null, 2));
      return response.data;
   } catch (error) {
      console.error(
         "Error disconnecting peer:",
         error.response ? error.response.data : error.message,
      );
      throw error;
   }
}

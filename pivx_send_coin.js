const async = require('async');
const bitcore = require('bitcore-lib');
const RpcClient = require('bitcoind-rpc');

const request = require('request');
var PrivateKey = "cTNYZoYoR1ti4Mkjv3PuyWJjK2ztCxcmnV4mWndK2VT2mdEErSAS"
var addressFrom = "yCNYRvSdPR79RUUKrXXa6eUMt6CQcMzh4Y"
var addressTo = "yESadXbtc51mfVzcRZ5F3bH8tq9Lq7yN24"
const config = {
    protocol: 'http',
    user: 'user',
    pass: 'pass',
    host: '127.0.0.1',
    port: '51475',
  };
const rpc = new RpcClient(config);

async.auto({
  utxo: (next) =>{
  	rpc.listUnspent(1,9999999,[addressFrom],next)
  },
}, (err,ret) =>{
	if (err) {
		console.log(err);
	}else {
		var utxos = ret.utxo.result;
		const inputs = [];
		var amountSend = 10000;
		for (let i = 0; i < utxos.length; i++) {
			const utxo = utxos[i];
			console.log(utxo);
			inputs.push(new bitcore.Transaction.UnspentOutput(utxo))
		}
		// console.log("message",inputs);
		var tx = new bitcore.Transaction()
          .from(inputs)          // Feed information about what unspent outputs one can use
	      .to(addressTo, amountSend)  // Add an output with the given amount of satoshis
	      .change(addressFrom)      // Sets up a change address where the rest of the funds will go
	      .sign(PrivateKey)     // Signs all the inputs it ca
     
        const tx_raw = tx.serialize();
	     console.log(tx_raw);

	     rpc.sendRawTransaction(tx_raw,function(err,ret){
	     	if (err) {
	     		console.log("err");
	     	}else{
	     		console.log("oki");
	     	}
	     })
	}
});



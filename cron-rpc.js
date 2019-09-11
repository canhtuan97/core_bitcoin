const async = require('async');
const bitcore = require('bitcore-lib');
const RpcClient = require('bitcoind-rpc');
const cron = require('cron');
var fs = require('fs');
var sleep = require('system-sleep');
const request = require('request');

const config = {
    protocol: 'http',
    user: 'user',
    pass: 'pass',
    host: '127.0.0.1',
    port: '51475',
  };

const rpc = new RpcClient(config);


var address1 = "y7qk8CiFmaGxuK7FWTNL18YEj6FVjN9oH8"
var address2 = "xxhGSJRKjPtfd2gNdnt11jBEnzgLkXMsTd"
var address3 = "y4VZCMjRujZ72HQf12FAEty5eQTiXpwwB2"

var fee = 0.01


// load address in DB
function loadAddress(){
	var address1 = "y7qk8CiFmaGxuK7FWTNL18YEj6FVjN9oH8"
	var address2 = "xxhGSJRKjPtfd2gNdnt11jBEnzgLkXMsTd"
	var address3 = "y4VZCMjRujZ72HQf12FAEty5eQTiXpwwB2"
	var address = [address1,address2,address3]
	return address;
	
}

// create transaction 
// return hex
function createTransaction(utxos,privateKey,addressFrom,addressTo,amountSend){
	const inputs = [];
	amountSend = amountSend * 100000000

	for (let i = 0; i < utxos.length; i++) {
		const utxo = utxos[i];
		inputs.push(new bitcore.Transaction.UnspentOutput(utxo))
	}
	// create transaction   
	// parameters : txid input ,sender address and receiver address,private key sender
	var tx = new bitcore.Transaction()
      .from(inputs)          // Feed information about what unspent outputs one can use
      .to(addressTo, amountSend)  // Add an output with the given amount of satoshis
      .change(addressFrom)      // Sets up a change address where the rest of the funds will go
      .sign(privateKey)     // Signs all the inputs it ca
 	// Signed created transactions
    const tx_raw = tx.serialize();
    if (tx_raw == null) {
    	return null
    }else{
    	return tx_raw;
    }
    
}


// 


function send(privateKey,addressFrom,addressTo,amountSend,fee){
		async.auto({
		  utxo: (next) =>{
		  	// load listunspent of a address 
		  	rpc.listUnspent(1,9999999,[addressFrom],next)
		  },
		}, (err,ret) =>{
			if (err) {
				logger.error(" can't load listUnspent " +err);
				console.log(err);
			}else {
				var utxos = ret.utxo.result;
				
				var balance = 0;
				for (var i = 0; i < utxos.length; i++) {
					balance += utxos[i].amount;
				}

				var sum = amountSend  + fee 
				
				if (balance >= sum) {
					var tx_raw = createTransaction(utxos,privateKey,addressFrom,addressTo,amountSend);
				    rpc.sendRawTransaction(tx_raw,function(err,ret){
				     	if (err) {
				     		logger.error(" err send coin " + getDateTime() );
				     		console.log("err");
				     	}else{
				     		logger.info("send coin addressFrom" + addressFrom +"=" + addressTo +"=" + amountSend+ getDateTime())
				     		console.log("oki");
				     	}
				     })
					
				}else{
					console.log("Not enough money")
				}

			
			}
		});	
}

function collector(addressMain,address){
	// let address = "y4VZCMjRujZ72HQf12FAEty5eQTiXpwwB2"
	// let addressMain = "y9ZcnMMxEz2197pHhMAF9oNYYMrMbm8g7G"
	console.log(addressMain,address);
	var unspents = []
	rpc.listUnspent(1,9999999,[address],function(err,ret){
		if (err) {
			console.log("can't load listunspent");
		}else{
			const inputs = [];
			var balance = 0
			var utxos = ret.result;
			for (let i = 0; i < utxos.length; i++) {
					const utxo = utxos[i];
					console.log(utxo);
					inputs.push(new bitcore.Transaction.UnspentOutput(utxo))
					balance += utxos[i].amount;
			}
			createTransaction(inputs,balance,addressMain,address)
		}
	})


} 

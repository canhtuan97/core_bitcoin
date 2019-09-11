var fs = require('fs');

const request = require('request');
const rpcUser = "user";
const rpcPass = "pass";
const rpcUrl = "http://localhost:8332";
const minConfirmation = 6;

var requestOpt = {
	url: rpcUrl,
	method: "post",
	headers:
	{
		"content-type": "text/plain"
	},
	auth: {
		user: rpcUser,
		pass: rpcPass
	},
	body: JSON.stringify( {"jsonrpc": "2.0", "id": "curltest", "method": "listunspent", "params": [] })
};

function getBalance(address){
	let options = requestOpt;
	options.body = JSON.stringify( {"jsonrpc": "2.0", "id": "curltest", "method": "listunspent", "params": [minConfirmation, 99999999, [address]] });

	request(options, (error, response, body) => {
		if (error) {
			console.log({"result":"error"});
		} else {
			let transactions = JSON.parse(body).result;
			let balance = 0;

			if (transactions.length > 0) {
				for(var i = 0; i < transactions.length; i++) {
					balance += transactions[i].amount;
				}
				console.log('Balance: '+ balance);
			} else {
				console.log('Balance: 0 or Unconfirmed');
			}
		}
	});
}

function sendCoin(addressFrom, addressTo, amountToSend, privateKey){
	let options = requestOpt;
	options.body = JSON.stringify( {"jsonrpc": "2.0", "id": "curltest", "method": "listunspent", "params": [minConfirmation, 99999999, [addressFrom]] });

	request(options, (error, response, body) => {
		if (error) {
			console.log({"result":"error"});
		} else {
			let transactions = JSON.parse(body).result;

			if (transactions.length > 0) {
				_createrawtransaction(transactions, privateKey, addressFrom, addressTo, amountToSend, 0);
			} else {
				console.log('Nothing to spend');
			}
		}
	});
}

function _createrawtransaction(unspentList, privateKey, addressFrom, addressTo, amountToSend, fee) {
	var unspents = [];
	var outputs = {};
	var senderAmount = 0;
	for(var i = 0; i < unspentList.length; i++) {
			var txid = unspentList[i].txid;
			var vout = unspentList[i].vout;
			unspents.push({txid: txid,vout:vout});
		senderAmount += unspentList[i].amount;
	}

	if (senderAmount <= amountToSend) {
		console.log('Not enough balance!');
		return false;
	}

	senderAmount -= amountToSend;
	senderAmount -= fee;

	outputs[addressTo] = amountToSend;
	outputs[addressFrom] = senderAmount;

	var param1 = JSON.stringify(unspents);
	var param2 = JSON.stringify(outputs);

	var options = requestOpt;
	options.body = JSON.stringify( {"jsonrpc": "2.0", "id": "curltest", "method": "createrawtransaction", "params": [unspents, outputs] });

	request(options, (error, response, body) => {
		if (error) {
			console.log({"result":"error"});
			return false;
		} else {
			let balance = 0;

			let hexcode = JSON.parse(body).result;

			if (fee == 0) {
				// calculate transaction fee
				_getTransactionFee(hexcode, privateKey, unspentList, addressFrom, addressTo, amountToSend);
			} else {
				// sign rawtransaction
				_signTransaction(hexcode, privateKey);
			}

		}
	});
}

function _getTransactionFee(hexcode, privateKey, unspentList, addressFrom, addressTo, amountToSend) {
	var options = requestOpt;
	options.body = JSON.stringify( {"jsonrpc": "2.0", "id": "curltest", "method": "fundrawtransaction", "params": [hexcode, {changeAddress: addressFrom}] });

	request(options, (error, response, body) => {
		if (error) {
			console.log({"result":"error"});
			return false;
		} else {
			let balance = 0;

			let fee = JSON.parse(body).result;

			console.log('Fee: '+ fee.fee);

			// recreate rawtransaction with calculated fee
			_createrawtransaction(unspentList, privateKey, addressFrom, addressTo, amountToSend, fee.fee);
		}
	});
}

function _signTransaction(hexcode, privateKey) {
	var options = requestOpt;
	options.body = JSON.stringify( {"jsonrpc": "2.0", "id": "curltest", "method": "signrawtransactionwithkey", "params": [hexcode, [privateKey]] });

	request(options, (error, response, body) => {
		if (error) {
			console.log({"result":"error"});
			return false;
		} else {
			let signedHexcode = JSON.parse(body).result;

			// send to blockchain
			_sendTransaction(signedHexcode.hex);
			return true;
		}
	});
}

function _sendTransaction(hexcode) {
	var options = requestOpt;
	options.body = JSON.stringify( {"jsonrpc": "2.0", "id": "curltest", "method": "sendrawtransaction", "params": [hexcode] });

	request(options, (error, response, body) => {
		if (error) {
			console.log({"result":"error"});
			return false;
		} else {
			let txId = JSON.parse(body).result;

			console.log(txId);
		}
	});
}


let _addressFrom = "2NFpLZDGEU7dQKKvqJoVzJ8aTjuUrpvyM74";
let _addressTo = "2NBjFGJyR7Q4LjncjDp3HE8xZH9ETxPUn1o";
let _amountToSend = 0.5;

// sendCoin(_addressFrom, _addressTo, _amountToSend, "cVJCeqtUs4esNs9fKw5i4cVKwtrwAqsQnb3vdxXDvPUfKpvnXPSA");

getBalance('2NBjFGJyR7Q4LjncjDp3HE8xZH9ETxPUn1o');



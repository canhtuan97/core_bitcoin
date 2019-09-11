const bitcore = require('bitcore-lib');
const RpcClient = require('bitcoind-rpc');
const async = require('async');
const date = new Date();
var current_hour = date.getHours();
const cron = require('cron');
const request = require('request');
var logger = require('../helpers/logger')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
const dotenv  = require('dotenv')

const config = {
    protocol: 'http',
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: 51475
  };

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const rpc = new RpcClient(config);

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + ":" + hour + ":" + min + ":" + sec;

}




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


module.exports = function(app){

	//create info  address 
	app.get('/add_address',function(req,res){
		
		var privateKey = new bitcore.PrivateKey(null,'regtest');
		var convertKey = privateKey.inspect();
		var WIF = privateKey.toWIF();
		var address = privateKey.toAddress().inspect()
		var key = convertKey.split(" ");
		var convertAddress = address.split(" ")
		var result = {
			privateKey : key[1].substring(0, key[1].length - 1),
			WIF: WIF,
			address : convertAddress[1].substring(0, convertAddress[1].length - 1)
		}
		res.send(result);

	});
	//get info balance 
	app.get('/getBalance/:address',function(req,res){
		var address = req.params.address;
		async.auto({
		  utxo: (next) =>{
		  	// get  listunspent of a address want to send coin
		  	// return balance of address
		  	rpc.listUnspent(1,9999999,[address],next)
		  }
		}, (err,ret) =>{
			if (err) {
				logger.error("can't load listUnspent " + getDateTime() + err);
				res.send("err");
			}else {
				// var listunspent = ret.utxo;
				// res.send(listunspent)
				var listUtxo = ret.utxo.result;
				
				var balance = 0;
				for (var i = 0; i < listUtxo.length; i++) {
					balance += listUtxo[i].amount;
				}
				var data = {
					amount : balance
				}
				res.send(data)
				logger.info("load balance " + address + getDateTime() )
			}
		});

	});

	app.post('/test',urlencodedParser,function(req,res){
		var tuan = req.body.tuan

		res.send(tuan)
	})


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

	// send coin
	app.post('/send',function(req,res){
		var privateKey = req.body.privateKey
		var addressFrom = req.body.addressFrom
		var addressTo = req.body.addressTo
		var amountSend = req.body.amountSend;
		var fee = req.body.fee;
		var tuan = send(privateKey,addressFrom,addressTo,amountSend,fee);
		res.send(tuan)
	});




	
}
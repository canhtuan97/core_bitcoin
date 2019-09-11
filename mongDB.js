const async = require('async');
const bitcore = require('bitcore-lib');
const RpcClient = require('bitcoind-rpc');
const request = require('request');
var sleep = require('sleep');
//  <---------Khai báo Mongo----------->
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

// <---------------Code--------------->

const config = {
    protocol: 'http',
    user: 'user',
    pass: 'pass',
    host: '127.0.0.1',
    port: '51475',
  };



const rpc = new RpcClient(config);

function addBlock(blockNumber,blockHash){
	MongoClient.connect(url,{useNewUrlParser:true}, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("pivx");
	  var myobj = { blockNumber : blockNumber, blockHash :blockHash  };
	  dbo.collection("block").insertOne(myobj, function(err, res) {
	    if (err) throw err;
	    console.log("1 document inserted");
	    db.close();
	  });
	});
}
function findBlock(blockNumber,blockHash){
	// console.log(blockNumber);
	MongoClient.connect(url, {useNewUrlParser:true},function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("pivx");
	  dbo.collection("block").findOne({blockHash:blockHash}, function(err, result) {
	    if (err) {
	    	console.log(err);
	    }else{
	    	if (result == null) {
	    		addBlock(blockNumber,blockHash)
	    	}else{
	    		console.log("already exist");
	    	}
	    }
	    db.close();
	  });
	});
}

function addTransaction(blockHash,blockNumber,txid,address,category,amount,vout,vin){


	MongoClient.connect(url,{useNewUrlParser:true}, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("pivx");
	  var myobj = {
	  	txid:txid,
	  	blockHash:blockHash,
	  	blockNumber:blockNumber,
	  	address:address,
	  	category:category,
	  	amount:amount,
	  	vout:vout,
	  	vin:vin,
	  }
	  dbo.collection("transaction").insertOne(myobj, function(err, res) {
	    if (err) throw err;
	    console.log("1 document inserted");
	    db.close();
	  });
	});
}

function run(blockStart){
	console.log(blockStart);
	
	async.auto({
	
	getblockHash:(next) =>{
		rpc.getBlockHash(blockStart,next)
	},
	getBlock: ["getblockHash",(ret,next)=>{
		var blockHash = ret.getblockHash.result
		findBlock(blockStart,blockHash)
		rpc.getBlock(blockHash,next)
	}],
	},(err,ret)=>{
		if (err) {
			console.log(err);
		}else{
			var tx = ret.getBlock.result['tx']
			var blockHash = ret.getblockHash.result
			
			for (var i = 0; i < tx.length; i++) {
				var txid = tx[i] 
				rpc.getTransaction(tx[i],function(err,ret){
					if (err) {
						console.log(err);
					}else{
						var details = ret.result['details']
						var txid = ret.result['txid']
						let address
						let category
						let amount						
						let vout
						
						for (var i = 0; i < details.length; i++) {
							address = details[i].address
							category = details[i].category
							amount = details[i].amount
							vout = details[i].vout
							vin = details[i].vin
								
							addTransaction(blockHash,blockStart,txid,address,category,amount,vout,vin)
						}
						
					}
				})
			}
			
		}

	})

	
}



function listenNetWork(){
	var blockStart = 100
	var blockMAX = 110
	var getInfo = setInterval(function(){
		rpc.getInfo(async function(err,ret){
			if (err) {
				console.log("err");
			}else{
				blockMAX = ret.result.blocks
				console.log(blockMAX);
				if (blockMAX >  blockStart) {
					console.log("run");
					tuan = await run(blockStart);
					blockStart++;
				}else{
					console.log("lisening");
				}
			}
		})
	}, 2000);

}

listenNetWork()
const bitcore = require('bitcore-lib');
const RpcClient = require('bitcoind-rpc');
const async = require('async');

const request = require('request');

const config = {
    protocol: 'http',
    user: 'user',
    pass: 'pass',
    host: '127.0.0.1',
    port: '18443',
  };
const rpc = new RpcClient(config);

    var addressFrom = "2MyXbLR73H2skkh45TbWFjCAwaFReUiWKdG"
    var addressTo = "2NDGvTvUVipv1YrqyNUWkor4xqtjQKRFCBB"
    var PrivateKey= "cQ7aN7YVbCKnGfketaT6CFqvPcPgH3h3GcbFAK7DHiA8DLZy1HhR"
    rpc.listUnspent(1,9999999,[addressFrom],function(err,ret){
    if (err) {
        console.log(err);
    }else{
        
        var unspents = [];
        var outputs = {};
        var senderAmount = 0;
        var unspentList = ret.result;
        var amountToSend = 1;
        var fee = 0.01
        for(var i = 0; i < unspentList.length; i++) {
            var txid = unspentList[i].txid;
            var vout = unspentList[i].vout;
            unspents.push({txid: txid,vout:vout});
            senderAmount += unspentList[i].amount;
        }
        console.log(unspents);
        if (senderAmount <= amountToSend) {
        console.log('Not enough balance!');
        return false;
        }else{
            console.log("oki enough balance!");
        }
        console.log(senderAmount);
        senderAmount -= amountToSend;
        senderAmount -= fee;
        outputs[addressTo] = amountToSend;
        outputs[addressFrom] = senderAmount;

        // console.log(unspents);
        // console.log(outputs);
       rpc.listUnspent(1,9999999,[addressFrom],function(err,ret){
        if (err) {
            console.log(err);
        }else{
            var utxo = ret;
            console.log(utxo);

            var tx = new bitcore.Transaction()
              .from(utxo)          // Feed information about what unspent outputs one can use
              .to(addressTo, amountToSend)  // Add an output with the given amount of satoshis
              .change(addressFrom)      // Sets up a change address where the rest of the funds will go
              .sign(PrivateKey)  
              tx.serialize()

            console.log(tx);
        }
       })

    }



    })




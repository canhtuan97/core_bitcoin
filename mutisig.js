const async = require('async');
const bitcore = require('bitcore-lib');
const RpcClient = require('bitcoind-rpc');

var fs = require('fs');


const config = {
    protocol: 'http',
    user: 'user',
    pass: 'pass',
    host: '127.0.0.1',
    port: '51475',
  };

const rpc = new RpcClient(config);


var address1 = "yDVqg395EdFv7YTHQMioKtkwCysErjCJ6x"
var address2 = "y9MJZHPPagoRg39aoLLGvuMqpmtvgjRJ47"
var address3 = "yCQg5cXcyseg3aVq7dnSqqSYp3s4J2RVMF"


var pubkey1 = "036cc269fc65fa7102a1eb4d07cfa2bdc85b73a9654fea133e9a38dc43689bcaac"
var pubkey2 = "03be578fd5b97c3eb44cbeb89bedb86b14e47c3b14f54151ffb068230811f23a0c"
var pubkey3 = "024f9b0b057615618ec83b0557fcb6ea392be540b92f40215fcda59ebb3c723000"

var nkey = 2




var pkey = [pubkey1,pubkey2,pubkey3]
async.auto({
  createMultiSig: (next) =>{
  	rpc.createmultisig(nkey,pkey,next)
  },
}, (err,ret) =>{
	if (err) {
		console.log(err);
	}else {
		var addressMultisig = ret.createMultiSig.result['address'];
		console.log(addressMultisig);
	}
});


// console.log(tuan);
// rpc.createMultiSig(nkey,tuan,function(err,ret){
// 	if (err) {
// 		console.log(err);
// 	}else{
// 		console.log(ret);
// 	}
// })
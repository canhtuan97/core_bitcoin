Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545"))

function sendCoin1(fromAddess, toAddress, amount) {
    return new Promise((resolve, reject) => {
        web3.eth.sendTransaction({ from: fromAddess, to: toAddress, value: web3.utils.toWei(amount, "ether") }, function(err, result) {
            if (!err) {
                resolve(result)
            } else {
                resolve('amount invalid')
            }
        })
    })
}

sendCoin1("0xE9dcccaAa41d4Dc49070DF663824f8Bf8F28E8bf","0x9dcc05dc3dC216425363cD6F37f09aB543E69424","20")
var initCall = function (callback) {
    var params = {};

    params.from = initAddress;
    params.to = ContractAddress;
    params.gasLimit = Utils.toBigNumber("200000").toNumber();
    params.gasPrice = Utils.toBigNumber("1000000").toNumber();

    // prepare value
    let value = Utils.toBigNumber(0);
    params.value = value;

    // prepare nonce
    // needs refresh data on every 'test' and 'commit' call, because data update may slow,
    // you can get different result by hit 'test' multiple times
    neb.api.getAccountState(params.from).then(function (resp) {
        var balance = nebulas.Unit.fromBasic(resp.balance, "nas");
        params.nonce = parseInt(resp.nonce) + 1;
        callback(params);
    }).catch(function (err) {
        // console.log("prepare nonce error: " + err);
        bootbox.dialog({
            backdrop: true,
            onEscape: true,
            message: err.message,
            size: "large",
            title: "Error"
        });
    });
};
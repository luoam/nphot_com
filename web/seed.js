var nebulas = require("nebulas"),
    Utils = nebulas.Utils,
    neb = new nebulas.Neb();
//Testnet:
// var ContractAddress = "n1oXb3fhbbWkSZ74tcUvkkUJsWCUHaLTgG3";
// var chainId = "1001";
// var initAddress = "n1LRdxLWijiqci8zTF72o84y7npUBrizp8a";
// neb.setRequest(new nebulas.HttpRequest("https://testnet.nebulas.io"));

//Mainnet:
var ContractAddress = "n1v44Ey7vxZvjqAuKc6Qs8QEsupNJvCsinZ";
var chainId = "1";
var initAddress = "n1Lvduf7mV6NBXwi43ahP3RqRKrnp6jHa8D";
neb.setRequest(new nebulas.HttpRequest("https://mainnet.nebulas.io"));
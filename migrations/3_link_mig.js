const link = artifacts.require("link");
const Dex = artifacts.require("Dex");

module.exports = async function (deployer, networks, accounts) {
  await deployer.deploy(link);
  
  let dex = await Dex.deployed()
  let Link = await link.deployed()

  await dex.addToken(web3.utils.fromUtf8("LINK"), link.address)
  await Link.approve(dex.address, 500)
  await dex.deposit(500, web3.utils.fromUtf8("LINK"))
  
  /*let balanceOfLink = await Wallet.TokenBalances[accounts[0], web3.utils.fromUtf8("LINK")];
  console.log(balanceOfLink);*/
  

};

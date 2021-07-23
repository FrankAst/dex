const Dex = artifacts.require("Dex");
const link = artifacts.require("link");
const truffleAssert = require("truffle-assertions");

contract("Dex", async function(accounts){
   
   before(async function(){
     
       LINK = await link.deployed();
       
   
   })


   //test addtoken functionality. 
   it("should only allow the owner to add new tokens", async function(){
      
      let dex = await Dex.deployed();
      
      await truffleAssert.passes(dex.addToken(web3.utils.fromUtf8("LINK"), LINK.address,{from: accounts[0]}),truffleAssert.ErrorType.REVERT);
      await truffleAssert.fails(dex.addToken(web3.utils.fromUtf8("LINK"), LINK.address, {from: accounts[1]}),truffleAssert.ErrorType.REVERT); // also can use truffleAssert.reverts 
   })
   
   //test deposits of tokens.
   it("correctly handle deposited tokens", async function(){
      let dex = await Dex.new();
      await dex.addToken(web3.utils.fromUtf8("LINK"), LINK.address, {from: accounts[0]});
      await LINK.approve(dex.address, 500, {from: accounts[0]});
      
      let balanceOld = await dex.getBalanceOf(web3.utils.fromUtf8("LINK"), accounts[0]);
      await dex.deposit(300, web3.utils.fromUtf8("LINK"), {from: accounts[0]});
      let balanceNew = await dex.getBalanceOf(web3.utils.fromUtf8("LINK"), accounts[0]);
      assert(balanceOld < balanceNew,"deposit went bad");
   })
   
   //test eth deposits.
   it("shold correctly handle eth deposits!", async function(){
      let dex = await Dex.new();
      let balEthOld = await dex.getBalEth({from: accounts[0]})
      await dex.depositEth({from: accounts[0], value: web3.utils.toWei("1","ether")});
      let balEthNew = await dex.getBalEth({from: accounts[0]});
      assert(balEthOld < balEthNew, "failed to manage funds");
      console.log("old balance:", balEthOld.toString());
      console.log("new balance:", balEthNew.toString());
   
   })
    
   //test faulty token withdrawals.
   it("shoudl not allowed the user to withdraw more than it owns", async function(){
      
      let LINK = await link.new()
      let dex = await Dex.new();
      await dex.addToken(web3.utils.fromUtf8("LINK"), LINK.address, {from: accounts[0]});
      await LINK.approve(dex.address, 1000, {from: accounts[0]});
      await dex.deposit(300, web3.utils.fromUtf8("LINK"), {from: accounts[0]});

      await truffleAssert.fails(dex.withdraw(200,web3.utils.fromUtf8("LINK"),{from: accounts[2]}),truffleAssert.ErrorType.REVERT);
      await truffleAssert.fails(dex.withdraw(1000,web3.utils.fromUtf8("LINK"),{from: accounts[0]}),truffleAssert.ErrorType.REVERT)
   }) 

   //test correct withdraw functionality
   it("should allow the user to withdraw its funds successfuly", async function(){
      
      let LINK = await link.new();
      let dex = await Dex.new();
      
      await dex.addToken(web3.utils.fromUtf8("LINK"), LINK.address, {from: accounts[0]});
      await LINK.approve(dex.address, 500, {from: accounts[0]});
      
      await dex.deposit(300, web3.utils.fromUtf8("LINK"), {from: accounts[0]});
      
      let realBal = await LINK.balanceOf(accounts[0]);
      console.log("real bal antes", realBal.toNumber());

      await truffleAssert.passes(dex.withdraw(200,web3.utils.fromUtf8("LINK"),{from:accounts[0]}), truffleAssert.ErrorType.REVERT);
      
      let newRealBal = await LINK.balanceOf(accounts[0]);
      console.log("new balance", newRealBal.toNumber());
      assert(realBal.toNumber()+200 == newRealBal.toNumber(), "balances dont match"); 
   })   
   
})




const Dex = artifacts.require("Dex");
const truffleAssert = require("truffle-assertions");
const link = artifacts.require("link");

contract.skip("Dex", async function(accounts){

   //Testing limit orders
   //The user needs to have at least the amount of eth necessary for opening the order 
   it("should not allow an user to open a limit order without enough eth", async function(){
      
      let dex = await Dex.deployed();
      let LINK = await link.deployed();

      await truffleAssert.reverts(dex.placeLimitOrder(web3.utils.fromUtf8("LINK"), 10,1,0))
      
      let oldBalance = await dex.getBalEth({from: accounts[0]});
      console.log("old balance:", oldBalance.toString());

      await dex.depositEth({value:10, from:accounts[0]});
      let balance = await dex.getBalEth({from: accounts[0]});
      console.log("eth balance:", balance.toString());

      await truffleAssert.reverts(dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),10,3,0));
       })


   //The users should have the amount he wants to sell in their balance
   it("shouldnt allow the user to place an order with an amount he does not own", async function(){
    
      let dex = await Dex.new();
      let LINK = await link.new();
      
      let Account0wnedlink = await LINK.balanceOf(accounts[0]);
      console.log("link inciial del contrato LINK: ", Account0wnedlink.toString());
      await dex.addToken(web3.utils.fromUtf8("LINK"), LINK.address);
      await dex.depositEth({value: 10, from: accounts[0]})
      
      let initiaLink = await dex.getBalanceOf(web3.utils.fromUtf8("LINK"),accounts[0]);
      console.log("Cantidad de LINK inicial:", initiaLink.toString());

      await LINK.approve(dex.address, 500);
      await dex.deposit(50,web3.utils.fromUtf8("LINK"));
      let newlinkamount = await dex.getBalanceOf(web3.utils.fromUtf8("LINK"), accounts[0]);
      console.log("New amount of LINK:", newlinkamount.toString());

      await truffleAssert.fails(dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),460,1,1), truffleAssert.ErrorType.REVERT);
    })
  
   //The newly created order should be place correctly in the order book.
   it("should add the BUY orders in the right order in the bookorder", async function(){
      
      let dex = await Dex.new();
      let LINK = await link.new();
      
      await dex.addToken(web3.utils.fromUtf8("LINK"), LINK.address);
      await dex.depositEth({value: 1000, from: accounts[0]})
      
      await LINK.approve(dex.address, 500);
      await dex.deposit(250,web3.utils.fromUtf8("LINK"));
      
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"), 5,1, 0);
      let order1 = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),0);
      console.log(order1);

      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),13,4,0);
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),12,2,0);

      let orders = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 0);
     // assert(orders.lenght >0, "there are no orders");
      console.log(orders);
      assert(orders[0].price >= orders[1].price >= orders[2].price, "Order book is not in order.");
   
   })
   
   it("should add the sell order in the right order in the orderbook", async function(){
      
      let dex = await Dex.deployed();
      let LINK = await link.deployed();

      await dex.addToken(web3.utils.fromUtf8("LINK"), LINK.address);
      await dex.depositEth({value: 1000, from: accounts[0]})
      
      await LINK.approve(dex.address, 500);
      await dex.deposit(250,web3.utils.fromUtf8("LINK"));
      
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),13,2,1);
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),17,6,1);
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"), 14,4, 1);
      
      let SellOrders = await dex.getOrderBook(web3.utils.fromUtf8("LINK"), 1);
      //assert(SellOrders.lenght > 0, "there are no orders");

      assert(SellOrders[0].price <= SellOrders[1].price <= SellOrders[2].price, "Order book is not in order."); 
   })
})

contract("Dex", async function(accounts){

   //When creating a sell market order, the seller needs to have enough tokens for the trade
   it("should verify that the seller has the amount of tokens he wants to sell", async function(){
      
      let dex = await Dex.new();
      let Link = await link.new();

      await dex.addToken(web3.utils.fromUtf8("LINK"), Link.address);
      await dex.depositEth({value: 90, from: accounts[0]});

      await Link.approve(dex.address,500);

      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),10,5,0);

      let long0 = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),0);
      console.log("cantidad de ordenes abiertas:",long0.lenght); //should be 1

      await truffleAssert.reverts(dex.placeMarketOrder(1,web3.utils.fromUtf8("LINK"),15));
      
      let long1 = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),0);
      console.log("cantidad de ordenes abiertas:", long1.lenght);
      assert(long0.lenght == long1.lenght);
   })

   //When creating a buy market order, the buyer must have enough eth to pay for the adquisition
   it("Should check that the market buyer has enough eth to pay", async function(){
   
      let dex = await Dex.deployed();
      let Link = await link.deployed();

      await Link.approve(dex.address, 100)   
      await dex.deposit(25, web3.utils.fromUtf8("LINK")); 
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),25,5,1);

      await dex.depositEth({value:15, from: accounts[0]});

      await truffleAssert.reverts(dex.placeMarketOrder(0,web3.utils.fromUtf8("LINK"),20));
   })
  
   //Market orders can be submitted even if the order book is empty
   it("should let the user open a market order even if the order book is empty", async function(){
            
      let dex = await Dex.new();
      let Link = await link.new();

      await Link.approve(dex.address, 100)   
      await dex.deposit(25, web3.utils.fromUtf8("LINK")); 
      
      let orderbook = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),1)
      assert( orderbook.lenght == 0, "orderbook is not empty");

      await truffleAssert.passes(dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),25,5,1));
   })

   //Market orders should be filled until its 100% filled or until the order book is empty.
   describe("Market orders should be filled untils 100% filled or until the order book is empty",() => {
   
    it("should fill the order until its 100% filled", async function(){
         
      let dex = await Dex.new();
      let Link = await link.new();

      //Load ammo
      await dex.addToken(web3.utils.fromUtf8("LINK"), Link.address);
      await dex.depositEth({value: 200, from: accounts[0]});
      await Link.approve(dex.address,500);
      await dex.deposit(400, web3.utils.fromUtf8("LINK"));

      //buy test.
      
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),15,3,1);
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),10,2,1);
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),6,6,1);
      
      await truffleAssert.passes(dex.placeMarketOrder(web3.utils.fromUtf8("LINK"),24,0));
      
      let orderbookSELL = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),1);
      console.log(orderbook);
      
      let k = 0;
      for(i=0, i<orderbookSELL.lenght,i++){
         k= k + orderbookSELL[i].amount - orderbookSELL[i].filled;
      }
      assert(k == 7, "BUY TEST. Hay mas de 7 links en libro, algo salio mal");

      //sell test 
     
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),10,3,0);
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),6,4,0);
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),15,1,0);
      
      await truffleAssert.passes(dex.placeMarketOrder(web3.utils.fromUtf8("LINK"),18,1));
      
      let orderbookBUY = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),0);
      console.log(orderbookBUY);

      let j = 0;
      for(i=0, i<orderbookBUY.lenght,i++){
         j = j + orderbookBUY[i].amount - orderbookBUY[i].filled;
      }
      assert(j == 13)
    })

    it("Should fill the order until the orderbook is empty", async function(){
     
      let dex = await Dex.new();
      let Link = await link.new();

      //Load ammo
      await dex.addToken(web3.utils.fromUtf8("LINK"), Link.address);
      await dex.depositEth({value: 400, from: accounts[0]});
      await Link.approve(dex.address,500); 
      await dex.deposit(400, web3.utils.fromUtf8("LINK"));
     
      //buy test. its the same for sell test.
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),15,3,1);
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),10,2,1);
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),6,6,1);
      
      await truffleAssert.passes(dex.placeMarketOrder(web3.utils.fromUtf8("LINK"),40,0));
      let orderbookSELL = await dex.getOrderBook(web3.utils.fromUtf8("LINK"),1);
      assert(orderbookSELL.lenght == 0,"Orderbook is not empty, therefore there is a problem");
   
    })

   }) // Describe end.

   Describe("managing eth balances after the trade", () =>{
    
    it("should decrease the eth balance of the buyer with the filled amount", async function(){
    
      let dex = await Dex.new();
      let Link = await link.new();
      
      //Load ammo
      await dex.addToken(web3.utils.fromUtf8("LINK"), Link.address);
      await dex.depositEth({value: 400, from: accounts[0]});
      await Link.approve(dex.address,500); 
      await dex.deposit(400, web3.utils.fromUtf8("LINK"));
      
      //set a sell order 
      await dex.placeMarketOrder(web3.utils.fromUtf8("LINK"),20,1,1);

      //Record balance before the trade.
      let ethbal = await dex.getBalEth(accounts[0]);
      console.log("initial eth balance:",ethbal.toNumber());

      //Perform the trade
      await dex.placeMarketOrder(web3.utils.fromUtf8("LINK"),20,0);
      let newethbal = await dex.getBalEth(accounts[0]);
      console.log("Post trade eth balance:", newethbal.toNumber());

      //test 
      assert(newethbal.toNumber() == ethbal - 20);
    })

    it("should increase the sellers eth balance after the trade", async function(){
      
      let dex = await Dex.new();
      let Link = await link.new();
      
      //Load ammo
      await dex.addToken(web3.utils.fromUtf8("LINK"), Link.address);
      await dex.depositEth({value: 400, from: accounts[0]});
      await Link.approve(dex.address,500); 
      await dex.deposit(400, web3.utils.fromUtf8("LINK"));
      
      //set a buy order 
      await dex.placeLimitOrder(web3.utils.fromUtf8("LINK"),20,0);
      
      //record balance before the trade 
      let ethbal = await dex.getBalEth(accounts[0]);
      console.log("initial eth balance:",ethbal.toNumber());
      
      //perform the trade 
      await dex.placeMarketOrder(web3.utils.fromUtf8("LINK"),20,1);
      let newethbal = await dex.getBalEth(accounts[0]);
      console.log("Post trade eth balance:", newethbal.toNumber());

      
       //test 
      assert(newethbal.toNumber() == ethbal + 20);
    })
   }) // Describe end.






})


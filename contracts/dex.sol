pragma solidity 0.8.0;

import "./wallet.sol";

contract Dex is wallet{

  enum Side{
    BUY, // 0
    SELL // 1

  }

  struct Order { 
    
    uint id;
    bytes32 ticker;
    uint amount;
    uint fill;
    uint price;
    Side side;
    address trader;
  }
  
  uint public nextOrderID; //contador de ordenes

  mapping(bytes32 => mapping(uint => Order[])) public orderBook;

  function getOrderBook(bytes32 _ticker, Side _side) view public returns(Order[] memory){
    return orderBook[_ticker][uint(_side)];
  
  }
  
  function placeLimitOrder(bytes32 _ticker, uint _amount,uint _price,  Side _side) public {
    if(_side == Side.BUY){
       require(ethBalance[msg.sender] >= _amount*_price, "Not enough ETH");
     }
    else if(_side == Side.SELL){
       require(TokenBalances[msg.sender][_ticker] >= _amount, "Not enough token quantity");
    }      

    Order[] storage orders = orderBook[_ticker][uint(_side)]; // this is a pointer.
    orders.push(
        Order(nextOrderID, _ticker,_amount,_price,_side,msg.sender)  
    );

    //Bubble sort ---- se puede optimizar. 
    
    uint l = orders.length;
  
    if( _side == Side.BUY){
      for(uint32 i=1; i<l;i++){
        uint32 j =i+1;
        if(orders[l-i].price>orders[l-j].price){
           Order memory cheaper = orders[l-j];
           orders[l-j] = orders[l-i];
           orders[l-i] = cheaper;
        }
        else { break; }
      }

    }
    else if(_side == Side.SELL){ 
    
      for(uint32 i=1; i<l;i++){
        uint32 j =i+1;
        if(orders[l-i].price<orders[l-j].price){
           Order memory mexpensive  = orders[l-j];
           orders[l-j] = orders[l-i];
           orders[l-i] = mexpensive;
        }
        else { break; }
      }
    }


    nextOrderID++;
  }

  function placeMarketOrder(bytes32 _ticker, uint _amount, Side _side) public {
     if(_side == Side.SELL){  
      require(getBalanceOf(_ticker, msg.sender) >= _amount);
     }
  
  }

}


pragma solidity 0.8.0;

import "../@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract link is ERC20{

  constructor() public ERC20("Chainlink", "LINK"){
    _mint(msg.sender, 1000);
  }


}


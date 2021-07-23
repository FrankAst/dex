pragma solidity 0.8.0;

import "../@openzeppelin/contracts/token/ERC20/IERC20.sol";    
import "../@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../@openzeppelin/contracts/access/Ownable.sol";
import "../@openzeppelin/contracts/utils/Address.sol";

contract wallet is ReentrancyGuard, Ownable{
  
  using Address for address;

  struct Token{
    bytes32 ticker;
    address TokenAddress;
  
  }
  
  mapping(bytes32 => Token) public TokenMapping;
  bytes32[] public tokenList;
  
  mapping(address => mapping(bytes32 => uint256)) public TokenBalances; // saves tokens.
  mapping(address => uint256) ethBalance;                        // saves eth.

  function addToken(bytes32 _ticker, address _tokenAddress) external onlyOwner {
    require(_tokenAddress.isContract(), "not a contract address");
    TokenMapping[_ticker] = Token(_ticker , _tokenAddress);
    tokenList.push(_ticker);
  }

  function depositEth() public payable{
    ethBalance[msg.sender] += msg.value;
  }
  
  function deposit(uint _amount, bytes32 _ticker) external {
    require(TokenMapping[_ticker].TokenAddress != address(0), "please add the token first");
   
    (bool sent) = IERC20(TokenMapping[_ticker].TokenAddress).transferFrom(msg.sender, address(this), _amount);
    if(sent){ 
      TokenBalances[msg.sender][_ticker] += _amount;

    }

  
  }
  
  function getBalanceOf(bytes32 _ticker, address _address) view public returns(uint){
  return TokenBalances[_address][_ticker];
  }

  function getBalEth() view public returns(uint){
  return ethBalance[msg.sender];
  }

  function withdraw(uint _amount, bytes32 _ticker) external onlyOwner {  
    // 1_ Checks
    require(TokenMapping[_ticker].TokenAddress != address(0), "add token first.");
    require(TokenBalances[msg.sender][_ticker] >= _amount, " insuficient funds");
    // 2_ Effects
    TokenBalances[msg.sender][_ticker] -= _amount;
    // 3_ Interactions
    IERC20(TokenMapping[_ticker].TokenAddress).transfer(msg.sender, _amount);
  }
  
  function withdrawEth(uint256 _amount) external onlyOwner nonReentrant {  //Reentrancy Guard should be used.
    // 1_ Checks
    require(ethBalance[msg.sender] >= _amount, "not enough eth");
    // 2_ Effects
    ethBalance[msg.sender] -= _amount;
    // 3_ Interactions
    payable(msg.sender).transfer(_amount);
  
  }
}

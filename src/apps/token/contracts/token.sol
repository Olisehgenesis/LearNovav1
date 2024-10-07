// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract QuizToken is ERC20, Ownable {
    constructor() ERC20("LearnNova Token", "LNT") Ownable(msg.sender) {
        _mint(msg.sender, 1000000000 * 10 ** 18); // Initial supply of 1 billion tokens
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20} from "../node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract BridgedTokenContract is ERC20, Ownable {
    constructor(
        address mintTokenAccount
    ) ERC20("bridgedtoken", "BRIDGEDTOKEN") Ownable(msg.sender) {}

    function mint(uint256 _amount, address to) external onlyOwner {
        _mint(to, _amount);
    }

    function burn(uint256 _amount, address _burnFrom) external onlyOwner {
        _burn(_burnFrom, _amount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "../node_modules/@openzeppelin/contracts/interfaces/IERC20.sol";

interface BridgedToken is IERC20 {
    function mint(uint256 _amount, address to) external;

    function burn(uint256 _amount, address _burnFrom) external;
}

contract MintAndBurnContract is Ownable {
    uint256 public totalAmount;
    BridgedToken tokenAccount;

    constructor(address _newOwner) Ownable(_newOwner) {
        totalAmount = 0;
        tokenAccount = BridgedToken(address(0));
    }

    function setTokenAddress(address bridgedTokenAddress) public onlyOwner {
        tokenAccount = BridgedToken(bridgedTokenAddress);
    }

    // token has been locked on other side so mint here to user
    function mintToAddressAfterLockSolana(
        uint256 _amount,
        address to
    ) public onlyOwner {
        require(address(tokenAccount) != address(0));
        tokenAccount.mint(_amount, to);
    }

    // token has been locked on other side so mint here to user
    function burnTokenFromAddress(uint256 _amount, address to) public {
        // TODO:: emit an event
    }
}

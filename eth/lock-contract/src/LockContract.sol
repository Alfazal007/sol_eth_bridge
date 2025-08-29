// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "../node_modules/@openzeppelin/contracts/interfaces/IERC20.sol";

event Deposit(
    address indexed depositor,
    string indexed solanaAddress,
    uint amount
);

contract LockContract is Ownable {
    uint256 public totalAmount;
    IERC20 tokenAccount;

    constructor(address _newOwner, address _tokenAccount) Ownable(_newOwner) {
        totalAmount = 0;
        tokenAccount = IERC20(_tokenAccount);
    }

    // user calls this and expects to receive solana side tokens
    function lock_and_emit(
        uint256 _amount,
        string memory _receiver_address
    ) public {
        require(_amount > 0, "amount should be greater than 0");
        require(
            tokenAccount.allowance(msg.sender, address(this)) >= _amount,
            "allowance not provided"
        );
        require(tokenAccount.transferFrom(msg.sender, address(this), _amount));
        totalAmount += _amount;
        emit Deposit(msg.sender, _receiver_address, _amount);
    }

    // nodejs calls this after solana tokens have gotten burnt
    function unlock(uint256 _amount, address to) public onlyOwner {
        require(_amount > 0, "amount should be greater than 0");
        require(totalAmount >= _amount, "amount too big");
        require(tokenAccount.transfer(to, _amount), "issue while transferring");
        totalAmount -= _amount;
    }
}

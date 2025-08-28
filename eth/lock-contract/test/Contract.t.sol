// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "src/LockContract.sol";
import "src/NormalToken.sol";

contract TestContract is Test {
    LockContract c;
    NormalTokenContract normalToken;
    address nodejsOwner = address(0x1eDc529e7C06856089BDf212CCd7A03d3da8dA7e);

    function setUp() public {
        normalToken = new NormalTokenContract();
        c = new LockContract(
            0x1eDc529e7C06856089BDf212CCd7A03d3da8dA7e,
            address(normalToken)
        );
        normalToken.mint(100, nodejsOwner);
        vm.startPrank(nodejsOwner);
        normalToken.approve(address(c), 60);
        c.lock_and_emit(50, "dsdsd");
        vm.stopPrank();
    }

    function initSupply() public {
        uint256 totalSupply = normalToken.totalSupply();
        assertEq(0, totalSupply);
        uint256 totalAmountInLockContract = c.totalAmount();
        assertEq(0, totalAmountInLockContract);
    }

    function testLockAndEmit() public {
        vm.startPrank(nodejsOwner);
        vm.expectEmit(true, true, true, true);
        emit Deposit(nodejsOwner, "dsds", 10);
        c.lock_and_emit(10, "dsds");
        vm.stopPrank();
        assertEq(60, c.totalAmount());
    }

    function testUnlock() public {
        assertEq(50, c.totalAmount());
        vm.startPrank(nodejsOwner);
        c.unlock(10, address(this));
        assertEq(40, c.totalAmount());
        vm.stopPrank();
    }
}

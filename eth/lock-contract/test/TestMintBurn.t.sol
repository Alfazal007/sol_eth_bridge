// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";

import "src/MintAndBurnContract.sol";
import "src/BridgedToken.sol";

contract TestContract1 is Test {
    MintAndBurnContract c;
    BridgedTokenContract bridgedToken;
    address nodejsOwner = address(0x1eDc529e7C06856089BDf212CCd7A03d3da8dA7e);

    function setUp() public {
        c = new MintAndBurnContract();
        bridgedToken = new BridgedTokenContract(address(c));
        c.setTokenAddress(address(bridgedToken));
    }

    function testMintTest() public {
        c.mintToAddressAfterLockSolana(10, nodejsOwner);
        assertEq(10, bridgedToken.balanceOf(nodejsOwner));
    }

    function testBurn() public {
        c.mintToAddressAfterLockSolana(10, nodejsOwner);
        assertEq(10, bridgedToken.balanceOf(nodejsOwner));
        vm.startPrank(nodejsOwner);
        vm.expectEmit(true, true, true, true);
        emit Burn(nodejsOwner, "sdsds", 5);
        c.burnTokenFromAddress(5, "sdsds");
        vm.stopPrank();
        assertEq(5, bridgedToken.balanceOf(nodejsOwner));
        assertEq(5, bridgedToken.totalSupply());
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SWFSovereignEngine {
    address public admin;
    mapping(address => string) public roleRegistry;
    mapping(string => uint256) public roleAllocations;
    address[] public recipients;

    constructor() {
        admin = msg.sender;

        // Initialize wallet roles and percentages
        _register(0xCe36333A88c2EA01f28f63131fA7dfa80AD021F6, "Main Distributor", 15);
        _register(0x26A8401287cE33CC4aeb5a106cd6D282a9C2f51d, "Treasury", 20);
        _register(0x7456BB1ab2FBb40B67807563595Cb6c9698d9aA1, "Service Wallet", 5);
        _register(0x7E9A4698788d582F3B99364071f539841693201, "OTC Buyer 1", 5);
        _register(0x613afBE121004958cE6000CB2B14D1c8B0CbbB9, "OTC Buyer 2", 5);
        _register(0x6Ea77F0B7Fe41fe01661b8BD82aaDF95DBAA5E79, "OTC Buyer 3", 5);
        _register(0xCeDdb7dF2F6f1e1caC7AC767337A38Ab1D85e1eD, "OTC Buyer 4", 5);
        _register(0x50f7022033Ce4b1c025D7bFE56d0C27020Ae2Fe3, "Dividend Holder 1", 5);
        _register(0xEb02b2bC1CEb07F0B9bb78A8467CeB090A4643Fc, "Dividend Holder 2", 5);
        _register(0x3cCC9DEB6121aB5733a9F5715Dc92f4a40ED872A, "Dividend Holder 3", 5);
        _register(0x750a4dbc335D9de258D9d8297C002c4E002FdE34, "Dividend Holder 4", 5);
        _register(0x62c62b5Bc31cA7F04910d6Be28d74E07D82b4A5, "LP Wallet 1", 5);
        _register(0x5013Ae54fBaEC83106afA6cD26C06Ba64D2f718d, "LP Wallet 2", 5);
        _register(0x62850718f02f8f5874c0ADf156876eF01Ae8bE8C, "LP Wallet 3", 5);
        _register(0x8Af139af51Fc53DD7575e331Fbb039Cf029e2DF, "Governance Wallet", 3);
        _register(0xFE60C780Ba081a03F211d7eadD4ABcd34B60f78F, "Reward Collector", 2);
    }

    function _register(address wallet, string memory role, uint256 percentage) internal {
        roleRegistry[wallet] = role;
        roleAllocations[role] = percentage;
        recipients.push(wallet);
    }

    function getRecipientList() external view returns (address[] memory) {
        return recipients;
    }

    function getRole(address wallet) public view returns (string memory) {
        return roleRegistry[wallet];
    }

    function getAllocationByRole(string memory role) public view returns (uint256) {
        return roleAllocations[role];
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";
import "@thirdweb-dev/contracts/extension/PermissionsEnumerable.sol";

contract SovranWealthFund is ERC20Base, PermissionsEnumerable {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor(address mainDistributor, address treasury) 
        ERC20Base("Sovran Wealth Fund", "SWF", mainDistributor) 
    {
        _setupRole(DEFAULT_ADMIN_ROLE, mainDistributor);
        _setupRole(MINTER_ROLE, mainDistributor);
        _setupRole(MINTER_ROLE, treasury);

        // Assign roles to additional wallets (Uniswap, OTC, LP, etc.)
        address[14] memory minters = [
            0x7456BB1ab2FBb40B67807563595Cb6c9698d9aA1,
            0x7E9A4698788d582F3B99364071f539841693201,
            0x50f7022033Ce4b1c025D7bFE56d0C27020Ae2Fe3,
            0xEb02b2bC1CEb07F0B9bb78A8467CeB090A4643Fc,
            0x3cCC9DEB6121aB5733a9F5715Dc92f4a40ED872A,
            0x750a4dbc335D9de258D9d8297C002c4E002FdE34,
            0x613afBE121004958cE6000CB2B14D1c8B0CbbB9,
            0x2A5269E92C48829fdF21D8892c23E894B11D15e3,
            0xE6a77F0B7Fe41fe01661b8BD82aaDF95DBAA5E79,
            0xCeDdb7dF2F6f1e1caC7AC767337A38Ab1D85e1eD,
            0x62c62b5Bc31cA7F04910d6Be28d74E07D82b4A5,
            0x5013Ae54fBaEC83106afA6cD26C06Ba64D2f718d,
            0x62850718f02f8f5874c0ADf156876eF01Ae8bE8C,
            0x8Af139af51Fc53DD7575e331Fbb039Cf029e2DF
        ];

        for (uint i = 0; i < minters.length; i++) {
            _setupRole(MINTER_ROLE, minters[i]);
        }
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }
}
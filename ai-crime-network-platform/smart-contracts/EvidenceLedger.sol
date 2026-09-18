// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EvidenceLedger {
    struct Record {
        bytes32 docHash;
        address uploadedBy;
        uint256 timestamp;
        string ipfsCid;
    }

    mapping(bytes32 => Record) private records;      // docHash => record
    mapping(bytes32 => bool) private exists;

    event DocumentAnchored(bytes32 indexed docHash, address indexed by, string ipfsCid);

    function anchor(bytes32 docHash, string calldata ipfsCid) external {
        require(!exists[docHash], "Already anchored");
        records[docHash] = Record(docHash, msg.sender, block.timestamp, ipfsCid);
        exists[docHash] = true;
        emit DocumentAnchored(docHash, msg.sender, ipfsCid);
    }

    function verify(bytes32 docHash) external view returns (
        bool found, address by, uint256 at, string memory cid
    ) {
        Record memory r = records[docHash];
        return (exists[docHash], r.uploadedBy, r.timestamp, r.ipfsCid);
    }
}
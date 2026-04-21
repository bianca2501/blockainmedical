// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicalAccess {

    struct File {
        string fileHash;
        uint256 timestamp;
    }

    mapping(address => File[]) private userFiles;

    // 🔐 Access Control
    mapping(address => mapping(address => bool)) public permissions;

    event FileStored(address indexed user, string fileHash);
    event AccessGranted(address patient, address doctor);
    event AccessRevoked(address patient, address doctor);

    // Store file hash
    function storeFile(string memory _fileHash) public {
        userFiles[msg.sender].push(File(_fileHash, block.timestamp));
        emit FileStored(msg.sender, _fileHash);
    }

    function getFiles() public view returns (File[] memory) {
        return userFiles[msg.sender];
    }

    // Grant access
    function grantAccess(address doctor) public {
        permissions[msg.sender][doctor] = true;
        emit AccessGranted(msg.sender, doctor);
    }

    // Revoke access
    function revokeAccess(address doctor) public {
        permissions[msg.sender][doctor] = false;
        emit AccessRevoked(msg.sender, doctor);
    }

    // Check access
    function checkAccess(address patient, address doctor) public view returns (bool) {
        return permissions[patient][doctor];
    }
}
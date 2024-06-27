// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";

contract NFTAirdropTracker {
    address public owner;

    enum ClaimState {
        NotClaimed,
        Claimed,
        Airdropped
    }

    struct NFTInfo {
        address contractAddress;
        uint256 tokenId;
    }

    mapping(string => mapping(address => bool)) public projectAuthorizedCallers;
    mapping(string => mapping(string => ClaimState)) public nftClaimStates;
    mapping(string => address) public userWallets;
    mapping(string => string[]) private projectUserIds;
    mapping(string => NFTInfo) public projectNFTs;

    event ProjectCreated(string projectId, address nftAddress, uint256 tokenId);
    event ClaimRecorded(string projectId, string userId);
    event NFTAirdropped(string projectId, string userId);
    event WalletRecorded(string userId, address walletAddress);
    event EligibleUsersUpdated(string projectId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    modifier onlyAuthorized(string memory _projectId) {
        require(
            projectAuthorizedCallers[_projectId][msg.sender],
            "Not authorized for this project"
        );
        _;
    }

    function createProject(
        string memory _projectId,
        address _nftAddress,
        uint256 _tokenId
    ) public onlyOwner {
        require(
            !projectAuthorizedCallers[_projectId][owner],
            "Project already exists"
        );
        require(_nftAddress != address(0), "Invalid NFT address");
        projectAuthorizedCallers[_projectId][owner] = true;
        projectNFTs[_projectId] = NFTInfo(_nftAddress, _tokenId);
        emit ProjectCreated(_projectId, _nftAddress, _tokenId);
    }

    function addAuthorizedCaller(
        string memory _projectId,
        address _caller
    ) public onlyOwner {
        projectAuthorizedCallers[_projectId][_caller] = true;
    }

    function recordClaim(
        string memory _projectId,
        string memory _userId
    ) public onlyAuthorized(_projectId) {
        require(
            nftClaimStates[_projectId][_userId] == ClaimState.NotClaimed,
            "Already claimed or airdropped"
        );

        nftClaimStates[_projectId][_userId] = ClaimState.Claimed;
        projectUserIds[_projectId].push(_userId);
        emit ClaimRecorded(_projectId, _userId);
    }

    function markNFTAirdropped(
        string memory _projectId,
        string memory _userId
    ) public onlyAuthorized(_projectId) {
        require(
            nftClaimStates[_projectId][_userId] == ClaimState.Claimed,
            "NFT not claimed or already airdropped"
        );
        nftClaimStates[_projectId][_userId] = ClaimState.Airdropped;
        emit NFTAirdropped(_projectId, _userId);
    }

    function recordWalletAddress(
        string memory _userId,
        address _walletAddress
    ) public {
        require(_walletAddress != address(0), "Invalid wallet address");
        userWallets[_userId] = _walletAddress;
        emit WalletRecorded(_userId, _walletAddress);
    }

    function getEligibleUsersForAirdrop(
        string memory _projectId
    ) public view returns (address[] memory) {
        string[] memory allUsers = projectUserIds[_projectId];
        address[] memory eligibleAddresses = new address[](allUsers.length);
        uint256 eligibleCount = 0;

        for (uint256 i = 0; i < allUsers.length; i++) {
            string memory userId = allUsers[i];
            address userWallet = userWallets[userId];
            if (
                nftClaimStates[_projectId][userId] == ClaimState.Claimed &&
                userWallet != address(0)
            ) {
                eligibleAddresses[eligibleCount] = userWallet;
                eligibleCount++;
            }
        }

        assembly {
            mstore(eligibleAddresses, eligibleCount)
        }

        return eligibleAddresses;
    }

    function updateEligibleUsersForAirdrop(
        string memory _projectId
    ) public onlyAuthorized(_projectId) {
        address[] memory eligibleAddresses = getEligibleUsersForAirdrop(
            _projectId
        );
        NFTInfo memory nftInfo = projectNFTs[_projectId];
        require(
            nftInfo.contractAddress != address(0),
            "NFT not set for this project"
        );

        IERC1155 nftContract = IERC1155(nftInfo.contractAddress);

        for (uint256 i = 0; i < eligibleAddresses.length; i++) {
            address userAddress = eligibleAddresses[i];
            uint256 balance;
            try nftContract.balanceOf(userAddress, nftInfo.tokenId) returns (
                uint256 _balance
            ) {
                balance = _balance;
            } catch {
                revert("Error checking NFT balance");
            }

            if (balance > 0) {
                string[] memory allProjectUserIds = projectUserIds[_projectId];
                for (uint256 j = 0; j < allProjectUserIds.length; j++) {
                    if (userWallets[allProjectUserIds[j]] == userAddress) {
                        markNFTAirdropped(_projectId, allProjectUserIds[j]);
                    }
                }
            }
        }

        emit EligibleUsersUpdated(_projectId);
    }

    function doesProjectExist(
        string memory _projectId
    ) public view returns (bool) {
        return projectAuthorizedCallers[_projectId][owner];
    }

    function checkProjectAuthorization(
        string memory _projectId,
        address _caller
    ) public view returns (bool) {
        return projectAuthorizedCallers[_projectId][_caller];
    }

    function getNFTInfo(
        string memory _projectId
    ) public view returns (address, uint256) {
        NFTInfo memory nftInfo = projectNFTs[_projectId];
        return (nftInfo.contractAddress, nftInfo.tokenId);
    }

    function getClaimState(
        string memory _projectId,
        string memory _userId
    ) public view returns (ClaimState) {
        return nftClaimStates[_projectId][_userId];
    }
}

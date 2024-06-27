// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/// @title NFT Airdrop Tracking Contract
/// @notice This contract manages NFT airdrop claims and status for multiple projects, created for the Onchain Summer Buildathon
contract NFTAirdropTracker {
    /// @notice The address that deployed the contract and has special permissions
    address public owner;

    /// @notice Enum to represent the state of an NFT claim
    enum ClaimState {
        NotClaimed,
        Claimed,
        Airdropped
    }

    /// @dev Mapping: projectId => caller address => is authorized
    mapping(string => mapping(address => bool)) public projectAuthorizedCallers;

    /// @dev Mapping: projectId => userId => ClaimState
    mapping(string => mapping(string => ClaimState)) public nftClaimState;

    /// @notice Emitted when a new project is created
    event ProjectCreated(string projectId);

    /// @notice Emitted when a claim is recorded for a user
    event ClaimRecorded(string projectId, string userId);

    /// @notice Emitted when an NFT is marked as airdropped to a user
    event NFTAirdropped(string projectId, string userId);

    constructor() {
        owner = msg.sender;
    }

    /// @notice Ensures that only the contract owner can call a function
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    /// @notice Ensures that only authorized callers can interact with a specific project
    modifier onlyAuthorized(string memory _projectId) {
        require(
            projectAuthorizedCallers[_projectId][msg.sender],
            "Not authorized for this project"
        );
        _;
    }

    /// @notice Creates a new project and authorizes the contract owner for it
    function createProject(string memory _projectId) public onlyOwner {
        require(
            !projectAuthorizedCallers[_projectId][owner],
            "Project already exists"
        );
        projectAuthorizedCallers[_projectId][msg.sender] = true;
        emit ProjectCreated(_projectId);
    }

    /// @notice Adds a new authorized caller for a specific project
    function addAuthorizedCaller(
        string memory _projectId,
        address _caller
    ) public onlyOwner {
        projectAuthorizedCallers[_projectId][_caller] = true;
    }

    /// @notice Records a claim for a user in a specific project
    function recordClaim(
        string memory _projectId,
        string memory _userId
    ) public onlyAuthorized(_projectId) {
        require(
            nftClaimState[_projectId][_userId] == ClaimState.NotClaimed,
            "Already claimed or airdropped"
        );
        nftClaimState[_projectId][_userId] = ClaimState.Claimed;
        emit ClaimRecorded(_projectId, _userId);
    }

    /// @notice Marks an NFT as airdropped for a user in a specific project
    function markNFTAirdropped(
        string memory _projectId,
        string memory _userId
    ) public onlyAuthorized(_projectId) {
        require(
            nftClaimState[_projectId][_userId] == ClaimState.Claimed,
            "NFT not claimed or already airdropped"
        );
        nftClaimState[_projectId][_userId] = ClaimState.Airdropped;
        emit NFTAirdropped(_projectId, _userId);
    }

    /// @notice Gets the claim state for a user in a specific project
    /// @return ClaimState The current state of the claim (NotClaimed, Claimed, or Airdropped)
    function getClaimState(
        string memory _projectId,
        string memory _userId
    ) public view returns (ClaimState) {
        return nftClaimState[_projectId][_userId];
    }

    function doesProjectExist(
        string memory _projectId
    ) public view returns (bool) {
        return projectAuthorizedCallers[_projectId][owner];
    }
}

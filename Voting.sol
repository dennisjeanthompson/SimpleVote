// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Voting {
    struct Proposal {
        string description;
        uint256 voteCount;
        bool exists;
    }

    Proposal[] public proposals;
    // Mapping from proposal ID => voter address => has voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 indexed proposalId, string description);
    event VoteCast(uint256 indexed proposalId, address indexed voter);

    function createProposal(string memory _description) external {
        proposals.push(Proposal({
            description: _description,
            voteCount: 0,
            exists: true
        }));
        
        emit ProposalCreated(proposals.length - 1, _description);
    }

    function vote(uint256 _proposalId) external {
        require(_proposalId < proposals.length, "Proposal does not exist");
        require(!hasVoted[_proposalId][msg.sender], "You have already voted");

        proposals[_proposalId].voteCount += 1;
        hasVoted[_proposalId][msg.sender] = true;

        emit VoteCast(_proposalId, msg.sender);
    }

    function getProposal(uint256 _index) external view returns (string memory, uint256) {
        require(_index < proposals.length, "Invalid index");
        Proposal memory p = proposals[_index];
        return (p.description, p.voteCount);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Voting {
    struct Candidate {
        string name;
        uint voteCount;
    }

    address public owner;
    bool public votingActive;

    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;

    constructor(string[] memory candidateNames) {
        owner = msg.sender;
        for(uint i = 0; i < candidateNames.length; i++) {
            candidates.push(Candidate(candidateNames[i], 0));
        }
        votingActive = true;
    }

    function vote(uint256 candidateIndex) external {
        require(votingActive, "Voting has ended");
        require(!hasVoted[msg.sender], "You already voted");
        require(candidateIndex < candidates.length, "Invalid candidate");

        candidates[candidateIndex].voteCount++;
        hasVoted[msg.sender] = true;
    }

    function endVoting() external {
        require(msg.sender == owner, "Only owner can end voting");
        votingActive = false;
    }

    function getCandidates() external view returns(Candidate[] memory) {
        return candidates;
    }
}
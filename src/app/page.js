"use client"

import { useEffect, useState } from "react";
import { BrowserProvider, ethers } from "ethers";
import VotingABI from "@/abi/Voting.json";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function Home() {
  const [candidates, setCandidates] = useState([]);
  const [votingActive, setVotingActive] = useState(true);
  const [account, setAccount] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if(!window.ethereum) return alert("Install Metamask");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    setAccount(accounts[0]);
  };

  const fetchData = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, VotingABI.abi, provider);

    const candidates = await contract.getCandidates();
    setCandidates(candidates);

    const status = await contract.votingActive();
    setVotingActive(status);

    const accounts = await provider.send("eth_requestAccounts", []);
    const voted = await contract.hasVoted(accounts[0]);
    setHasVoted(voted)
    setAccount(accounts[0]);
  };

  const vote = async (i) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, VotingABI.abi, signer);
      const tx = await contract.vote(i);
      await tx.wait();
      await fetchData();
    } catch (err) {
      console.log(err)
      alert("Voting failed")
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <main className="mx-auto max-w-xl">
      {!account ? (
        <button onClick={connectWallet} className="bg-blue-600 text-white p-4">
          Connect Wallet
        </button>
      ): (
        <p>Connected: {account}</p>
      )}
      {!votingActive && (
        <p className="text-red-600 font-semibold">Voting has ended.</p>
      )}
      {candidates.map((c, i) => (
        <div key={i}>
          <p className="text-black text-xl">{c.name}</p>
          <p>Votes: {c.voteCount.toString()}</p>
          <button
            disabled={!votingActive || hasVoted || loading}
            className="bg-red-600 p-5 text-white rounded-md disabled:opacity-50"
            onClick={() => vote(i)}
          >
            Vote
          </button>
        </div>
      ))}
      {hasVoted && <p>You have Voted</p>}
    </main>
  );
}

"use client"

import { useEffect, useState } from "react";
import { ethers, id } from "ethers";
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
    fetchData();
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
    window.ethereum?.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) fetchData();
    });
  }, [])

  return (
   <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-md bg-white rounded-xl shadow-md overflow-hidden p-6 space-y-6">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Blockchain Voting</h1>
          <p className="text-gray-600 mt-2">
            {votingActive ? "Cast your vote securely on the blockchain" : "Voting session has ended"}
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="bg-gray-100 p-4 rounded-lg">
          {!account ? (
            <button
              onClick={connectWallet}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Connected wallet</p>
                <p className="text-indigo-600 font-mono text-sm truncate">{account}</p>
              </div>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
          )}
        </div>

        {/* Voting Status */}
        {!votingActive && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 font-medium">Voting has ended. Results are final.</p>
              </div>
            </div>
          </div>
        )}

        {/* Candidates List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Candidates</h2>
          {hasVoted && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-700 font-medium">✓ You have already voted</p>
            </div>
          )}
          
          {candidates.map((candidate, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition duration-150">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-gray-800">{candidate.name}</h3>
                  <p className="text-gray-600 mt-1">
                    Votes: <span className="font-bold">{candidate.voteCount.toString()}</span>
                  </p>
                </div>
                <button
                  disabled={!votingActive || hasVoted || loading}
                  onClick={() => vote(index)}
                  className={`px-4 py-2 rounded-md font-medium text-white transition duration-200 ${
                    !votingActive || hasVoted || loading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700"
                  }`}
                >
                  {loading ? "Processing..." : "Vote"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500">
          <p>Each wallet can vote only once.</p>
          <p>Votes are recorded permanently on the blockchain.</p>
        </div>
      </div>
    </main>
  );
}

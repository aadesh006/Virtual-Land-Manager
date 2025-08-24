"use client";

import { useState, useEffect } from "react";
import { AppConfig, UserSession, showConnect, openContractCall } from "@stacks/connect";
// FIX 1: Import the StacksNetworks object (plural) as suggested by the error
import { StacksNetworks } from "@stacks/network";
import { fetchCallReadOnlyFunction, uintCV, cvToString, ClarityValue } from "@stacks/transactions";

// Define a type for our land parcel data
type LandParcel = {
  id: number;
  owner: string;
};

export default function Home() {
  const [userAddress, setUserAddress] = useState("");
  const [landParcels, setLandParcels] = useState<LandParcel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const appConfig = new AppConfig(["store_write"]);
  const userSession = new UserSession({ appConfig });

  // FIX 2: Select the testnet from the StacksNetworks object
  const network = StacksNetworks.testnet;

  // IMPORTANT: Make sure this is YOUR Testnet deployer address
  const contractAddress = "STP6Q28EQWFYHVXWWW4W0E6M1Z7GJ9WVRQB33C7E"; 

  const appDetails = {
    name: "Virtual Land Manager",
    icon: "https://freesvg.org/img/1541103084.png",
  };

  const connectWallet = () => { /* ... */ };
  const buyLand = (id: number) => { /* ... */ };

  const fetchLandParcels = async () => {
    console.log("1. Starting to fetch land parcels...");
    setIsLoading(true);
    try {
      const lastIdResult = await fetchCallReadOnlyFunction({
        contractAddress: contractAddress,
        contractName: "virtual-land-nft",
        functionName: "get-last-token-id",
        functionArgs: [],
        network: network,
        senderAddress: contractAddress,
      });
      console.log("2. Successfully fetched last token ID:", lastIdResult);

      const lastId = Number((lastIdResult as { value: bigint }).value);
      const parcels: LandParcel[] = [];

      for (let i = 1; i <= lastId; i++) {
        const ownerResult = await fetchCallReadOnlyFunction({
          contractAddress: contractAddress,
          contractName: "virtual-land-nft",
          functionName: "get-owner",
          functionArgs: [uintCV(i)],
          network: network,
          senderAddress: contractAddress,
        });

        if (ownerResult && (ownerResult as { value: ClarityValue }).value) {
            const ownerOptional = (ownerResult as { value: ClarityValue }).value;
            const owner = cvToString((ownerOptional as any).value);
            parcels.push({ id: i, owner: owner });
        }
      }
      setLandParcels(parcels);
      console.log("3. Finished fetching all parcels:", parcels);
    } catch (error) {
      console.error("4. Caught an error while fetching:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLandParcels();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center p-8 md:p-24 bg-gray-900 text-white">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">Virtual Land Manager</h1>
          {userAddress ? (
            <p className="bg-gray-700 px-4 py-2 rounded text-sm">
              Connected: {userAddress.substring(0, 6)}...{userAddress.substring(userAddress.length - 4)}
            </p>
          ) : (
            <button 
              onClick={connectWallet}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Connect Wallet
            </button>
          )}
        </div>

        <h2 className="text-2xl mb-4">Available Land Parcels</h2>

        {/* Grid for Land Parcels */}
        {isLoading ? (
          <p>Loading land parcels from the Testnet...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {landParcels.map((parcel) => (
              <div key={parcel.id} className="border border-gray-700 rounded-lg p-4 flex flex-col bg-gray-800">
                <div className="bg-gray-700 h-40 rounded mb-4 flex items-center justify-center">
                  <p className="text-gray-500 text-lg">Parcel #{parcel.id}</p>
                </div>
                <h3 className="text-xl font-semibold mb-2">Virtual Land Plot</h3>
                <p className="text-gray-400 text-xs mb-4">Owner: {parcel.owner.substring(0, 6)}...{parcel.owner.substring(parcel.owner.length - 4)}</p>
                <button onClick={() => buyLand(parcel.id)} className="mt-auto bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
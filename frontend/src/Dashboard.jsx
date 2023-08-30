import React from "react";
import Header from "./components/Header";
import VideoForm from "./Components/VideoForm";
import { useAccount } from "wagmi";

function Dashboard() {
  const { address } = useAccount();
  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <Header />
        {<h4 className="font-bold text-gray-800 text-center">Welcome back! {address}</h4>}
      <VideoForm />

    </div>
  );
}

export default Dashboard;

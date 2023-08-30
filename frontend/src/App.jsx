import React, { useEffect, useState } from "react";
import axios from "axios";
import { Player } from "@livepeer/react";
import Header from "./components/Header";
import { useAccount } from "wagmi";

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [ads, setAds] = useState([]);
  const [ispremium, setIspremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const { address } = useAccount();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const videoResponse = await axios.get("http://localhost:3000/videos");
        setVideos(videoResponse.data);

        const adsResponse = await axios.get("http://localhost:3000/ads");

        let isPremium = false;
        if (address) {
          const premiumResponse = await axios.get(`http://localhost:3000/ispremium/${address}`);
          isPremium = premiumResponse.data;
        }

        setIspremium(isPremium);
        if (!isPremium) {
          setAds(adsResponse.data);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);


  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <span>Loading...</span>
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
      </div>
    </div>;
  }



  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <Header />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
        {!ispremium && ads.map((ad) => (
          <AdCard key={ad._id} ad={ad} />
        ))}
      </div>
    </div>
  );
};

const VideoCard = ({ video }) => (
  <div className="max-w-md mx-auto my-4 p-4 border shadow-lg rounded-lg bg-white">
    <h2 className="text-xl font-semibold mb-1">{video.videoName}</h2>
    <p className="text-gray-600 truncate">{video.videoDisc}</p>
    <div className="flex items-center mt-2">
      <Player
        playbackId={video.videoURL}
        poster={video.videoThumbnail}
        controls
      />
    </div>
  </div>
);

const AdCard = ({ ad }) => (
  <div className="max-w-md mx-auto my-4 p-4 border shadow-lg rounded-lg bg-red-100">
    <h2 className="text-xl font-semibold mb-1">{ad.productName}</h2>
    <p className="text-gray-600 truncate">{ad.productDisc}</p>
    <div className="items-center mt-2">
      <a
        href={`${ad.CTALink}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 inline-block mb-2"
      >
        Learn More
      </a>
      <Player playbackId={ad.videoURL} controls />
    </div>
  </div>
);

export default HomePage;

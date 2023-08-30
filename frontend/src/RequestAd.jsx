import React, { useState } from "react";
import axios from "axios";
import FormData from "form-data";
import Header from "./components/Header";
import { useAccount } from "wagmi";
import Checkout from "./Checkout";

function RequestAd() {
  const { address } = useAccount();
  console.log(address);
  const [productName, setProductName] = useState("");
  const [productDisc, setProductDisc] = useState("");
  const [CTALink, setCTALink] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [videoURL, setVideoURL] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
    }
    if (file) {
      setIsLoading(true);
      try {
        const videoData = {
          name: productName,
          description: productDisc,
          videoUrl: file,
        };
        const response = await uploadAsset(videoData);
        setVideoURL(response?.asset[0].playbackId);
      } catch (err) {
        console.error("Error uploading video:", err);
      } finally {
        setIsLoading(false);
      }
    }
    event.target.value = null; // Reset the input's value
  };

  const uploadAsset = async (video) => {
    const formData = new FormData();
    formData.append("file", video.videoUrl);
    formData.append("name", video.name);
    formData.append("description", video.description);
    const response = await axios.post(
      "http://localhost:3000/uploadtolivepeer",
      formData
    );
    return response.data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const adData = {
        walletAddress: address,
        productName,
        productDisc,
        CTALink,
        videoURL,
      };
      const response = await axios.post("http://localhost:3000/ads", adData);
      console.log(response.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen justify-center items-center">
      <Header />
      <div className="flex justify-center items-center">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-96"
        >

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="walletAddress"
            >
              Wallet Address
            </label>
            <input
              type="text"
              value={address ? address : "Please connect your wallet"}
              readOnly
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="walletAddress"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="videoName"
            >
              Product Name
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="videoName"
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="videoDisc"
            >
              Product Description
            </label>
            <textarea
              value={productDisc}
              onChange={(e) => setProductDisc(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="videoDisc"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Upload Video
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="cursor-pointer"
              accept="video/*"
            />
          </div>
          {isLoading && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white"></div>
            </div>
          )}
          {videoURL && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Video URL
              </label>
              <a href={videoURL} target="_blank" rel="noopener noreferrer">
                {videoURL}
              </a>
            </div>
          )}
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="CTALink"
            >
              CTA Link
            </label>
            <input
              type="text"
              value={CTALink}
              onChange={(e) => setCTALink(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="CTALink"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
             <Checkout adName={productName} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestAd;

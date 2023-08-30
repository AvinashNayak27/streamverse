const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
const mongoose = require("mongoose");
const livepeer = require("@livepeer/react");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { provider: livepeerProvider } = livepeer.createClient({
  provider: livepeer.studioProvider({
    apiKey: "c4285fc2-fd7f-4e37-8e80-21c53f8e7308",
  }),
});
const { Framework } = require("@superfluid-finance/sdk-core");
const { CeloProvider } = require("@celo-tools/celo-ethers-wrapper");
const provider = new CeloProvider("https://forno.celo.org");



app.use(express.json());

const connect = async () => {
  await mongoose.connect("mongodb://localhost:27017/wavepool", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB!");
};

connect();

const adSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productDisc: {
    type: String,
    required: true,
  },
  CTALink: {
    type: String,
    required: true,
  },
  videoURL: {
    type: String,
    required: true,
  },
});

const videos = new mongoose.Schema({
  videoURL: {
    type: String,
    required: true,
  },
  videoName: {
    type: String,
    required: true,
  },
  videoDisc: {
    type: String,
    required: true,
  },
  videoThumbnail: {
    type: String,
  },
});

const Ad = mongoose.model("Ad", adSchema);
const Videos = mongoose.model("Videos", videos);

const createAd = async (data) => {
  const ad = new Ad(data);

  const result = await ad.save();
  return result;
};

const getAds = async () => {
  const ads = await Ad.find();
  return ads;
};

const deleteAd = async (id) => {
  const ad = await Ad.findByIdAndDelete(id);
  return ad;
};
const getAdbyCTALink = async (CTALink) => {
  const ad = await Ad.findOne({ CTALink: CTALink });
  return ad;
};

const getAddbyWalletAddress = async (walletAddress) => {
  const ad = await Ad.findOne({ walletAddress: walletAddress });
  return ad;
};

const createVideo = async (data) => {
  const video = new Videos(data);

  const result = await video.save();
  return result;
};

const getVideos = async () => {
  const videos = await Videos.find();
  return videos;
};

const deleteVideo = async (id) => {
  const video = await Videos.findByIdAndDelete(id);
  return video;
};

const getVideobyVideoURL = async (videoURL) => {
  const video = await Videos.findOne({ videoURL: videoURL });
  return video;
};

const getAllwalletAddress = async () => {
  const ads = await Ad.find();
  const requesters = ads.map((ad) => ad.walletAddress);
  return requesters;
};

const hello = async () => {
  const sf = await Framework.create({
    chainId: 42220,
    provider,
  });

  const celox = await sf.loadSuperToken("CELOx");

  const previousFlowInfos = {};
  const constantReceiver = "0x2910135944f79d2B649209BC580fd9B6e73E82f1";
  const senders = await getAllwalletAddress();
  console.log(senders);
  const previousFlowStatus = {};

  const checkFlowInfo = async (sender, receiver) => {
    const flowInfo = await celox.getFlow({
      sender,
      receiver,
      providerOrSigner: provider,
    });

    const key = `${sender}-${receiver}`;
    const currentFlowRate = flowInfo.flowRate;

    if (currentFlowRate === "0" && (!previousFlowStatus[key] || previousFlowStatus[key] !== "Not streaming")) {
      console.log("Requester", sender, "stopped streaming so deleting ad");
      try {
        const ad = await getAddbyWalletAddress(sender);
        await deleteAd(ad?._id);

      }
      catch (err) {
        console.log(err);
      }
      previousFlowStatus[key] = "Not streaming";
    } else if (currentFlowRate !== "0" && (!previousFlowStatus[key] || previousFlowStatus[key] !== "Streaming")) {
      if (
        !previousFlowInfos[key] ||
        JSON.stringify(flowInfo) !== JSON.stringify(previousFlowInfos[key])
      ) {
        console.log("flowInfo", flowInfo);
        previousFlowInfos[key] = flowInfo;
        console.log("Streaming for", key);
        previousFlowStatus[key] = "Streaming";
      }
    }
  };


  const senderReceiverPairs = senders?.map((sender) => ({
    sender,
    receiver: constantReceiver,
  }));

  console.log("senderReceiverPairs", senderReceiverPairs);

  senderReceiverPairs?.forEach(({ sender, receiver }) => {
    setInterval(async () => {
      await checkFlowInfo(sender, receiver);
    }, 1000);
  });
};


const ispremium = async (walletAddress) => {
  const sf = await Framework.create({
    chainId: 42220,
    provider,
  });

  const celox = await sf.loadSuperToken("CELOx");
  const flow = await celox.getFlow({
    sender: walletAddress,
    receiver: "0xaB90fEA2129f39cB3e4EEF24914e77663f670049",
    providerOrSigner: provider,
  });
  if (flow.flowRate === "0") {
    return false;
  } else {
    return true;
  }
};

app.get("/ispremium/:walletAddress", async (req, res) => {
  const { walletAddress } = req.params;
  const premium = await ispremium(walletAddress);
  res.send(premium);
});


app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/ads", async (req, res) => {
  await hello();
  const ads = await getAds();
  res.send(ads);
});

app.get("/videos", async (req, res) => {
  const videos = await getVideos();
  res.send(videos);
});

app.get("/requesters", async (req, res) => {
  const requesters = await getAllwalletAddress();
  res.send(requesters);
});

async function uploadAsset(video) {
  console.log("Uploading asset to livepeer..");

  const uploadingVideo = fs.createReadStream(video.videoUrl);

  const asset = await livepeerProvider.createAsset({
    sources: [
      {
        name: video.name,
        file: uploadingVideo,
      },
    ],
  });
  console.log("Asset uploaded successfully to livepeer");

  return asset;
}

app.post("/ads", async (req, res) => {
  try {
    const { walletAddress, productName, productDisc, CTALink, videoURL } =
      req.body;
    const ad = await createAd({
      walletAddress,
      productName,
      productDisc,
      CTALink,
      videoURL,
    });
    res.json({ ad });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred during ad creation" });
  }
});

app.post("/videos", async (req, res) => {
  try {
    const { videoURL, videoName, videoDisc } = req.body;
    const video = await createVideo({
      videoURL,
      videoName,
      videoDisc
    });
    res.json({ video });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred during video creation" });
  }
});


app.post("/uploadtolivepeer", upload.single("file"), async (req, res) => {
  try {
    const { name, description } = req.body;
    const videoUrl = req.file.path; // This is where multer saves the uploaded file
    const asset = await uploadAsset({ name, description, videoUrl });
    res.json({ asset });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred during Livepeer upload" });
  }
});

app.delete("/ads/:wallet", async (req, res) => {
  try {
    const { wallet } = req.params;
    const ad = await getAddbyWalletAddress(wallet);
    console.log(ad);
    const result = await deleteAd(ad?._id);
    res.json({ result });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred during ad deletion" });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000!");
});

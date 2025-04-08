const { ethers } = require("ethers");
const { MongoClient } = require("mongodb");
const { formatUnits } = ethers;

const AdminContract_abi1 = require("./AdminContract_multi.json");
const abi2 = require("./Trove_Manager_multi.json");
const { mongoUri, dbName } = require("./config");

const provider = new ethers.JsonRpcProvider("https://rpc.ankr.com/botanix_testnet");

const contracts = [
  {
    token: "wBTC",
    contractAddress: "0x3B23B92eb5C4a6E4C9e61dB99e69EA7148102210",
    abi: AdminContract_abi1,
    assetaddress: "0x321f90864fb21cdcddD0D67FE5e4Cbc812eC9e64",
  },
  {
    token: "rovBTC",
    contractAddress: "0x3B23B92eb5C4a6E4C9e61dB99e69EA7148102210",
    abi: AdminContract_abi1,
    assetaddress: "0xFE38CACa0D06EA8D42A88E3AE1535Aa34F592bC2",
  },
];

async function fetchAndReturnMetrics() {
  const client = new MongoClient(mongoUri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("metrics");
    const document = await collection.findOne();

    for (let i = 0; i < document.metrics.length; i++) {
      const metric = document.metrics[i];
      const contractInfo = contracts.find((c) => c.token === metric.token);

      if (contractInfo) {
        const contractInstance = new ethers.Contract(
          contractInfo.contractAddress,
          contractInfo.abi,
          provider
        );

        console.log("Contract asset new",contractInfo.assetaddress)

        const MCR = await contractInstance.getMcr(contractInfo.assetaddress);
        const CCR = await contractInstance.getCcr(contractInfo.assetaddress);
        const minDebt = await contractInstance.getMinNetDebt(contractInfo.assetaddress);
        const LR = await contractInstance.getDebtTokenGasCompensation(contractInfo.assetaddress);
        const mintCap = await contractInstance.getMintCap(contractInfo.assetaddress);

        metric.MCR = parseFloat(formatUnits(MCR, 18));
        metric.CCR = parseFloat(formatUnits(CCR, 18));
        metric.minDebt = parseFloat(formatUnits(minDebt, 18));
        metric.LR = parseFloat(formatUnits(LR, 18));
        metric.maxMint = parseFloat(formatUnits(mintCap, 18));

        // console.log(`✅ Updated ${metric.token}:`, {
        //   MCR: metric.MCR,
        //   CCR: metric.CCR,
        //   minDebt: metric.minDebt,
        //   LR: metric.LR,
        //   maxMint: metric.maxMint,
        // });
      }
    }

    await collection.updateOne({ _id: document._id }, { $set: { metrics: document.metrics } });
    return document.metrics;
  } catch (err) {
    console.error("❌ Error in fetchAndReturnMetrics:", err);
    return { error: err.message };
  } finally {
    await client.close();
  }
}

// Background auto-refresh every 30 minutes
setInterval(async () => {
  console.log("Running scheduled fetchAndReturnMetrics update...");
  await fetchAndReturnMetrics();
}, 30 * 60 * 1000); // 30 minutes

module.exports = fetchAndReturnMetrics;

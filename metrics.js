const { ethers } = require("ethers");
const { formatUnits } = ethers;
const connectDB = require("./database");
const { rpcUrl } = require("./config");
const AdminContract_abi1 = require("./AdminContract_multi.json");
const abi2 = require("./Trove_Manager_multi.json");

const provider = new ethers.JsonRpcProvider(rpcUrl);

const contracts = [
  {
    token: "wBTC",
    contractAddress: "0x36F40faDe724ECd183b6E93F2448de65207b08A2",
    abi: AdminContract_abi1,
    assetaddress: "0x321f90864fb21cdcddD0D67FE5e4Cbc812eC9e64",
  },
  {
    token: "rovBTC",
    contractAddress: "0x36F40faDe724ECd183b6E93F2448de65207b08A2",
    abi: AdminContract_abi1,
    assetaddress: "0xFE38CACa0D06EA8D42A88E3AE1535Aa34F592bC2",
  },
];

// async function fetchMetricsFromBlockchain() {
//   try {
//     const db = await connectDB();
//     const collection = db.collection("metrics");
//     const document = await collection.findOne();

//     for (let metric of document.metrics) {
//       const contractInfo = contracts.find((c) => c.token === metric.token);
//       if (contractInfo) {
//         const contract = new ethers.Contract(contractInfo.contractAddress, contractInfo.abi, provider);

//         metric.MCR = parseFloat(formatUnits(await contract.getMcr(contractInfo.assetaddress), 18));
//         metric.CCR = parseFloat(formatUnits(await contract.getCcr(contractInfo.assetaddress), 18));
//         metric.minDebt = parseFloat(formatUnits(await contract.getMinNetDebt(contractInfo.assetaddress), 18));
//         metric.LR = parseFloat(formatUnits(await contract.getDebtTokenGasCompensation(contractInfo.assetaddress), 18));
//         metric.maxMint = parseFloat(formatUnits(await contract.getMintCap(contractInfo.assetaddress), 18));
//       }
//     }

//     await collection.updateOne({ _id: document._id }, { $set: { metrics: document.metrics } });
//     return document.metrics;
//   } catch (error) {
//     console.error("❌ Error fetching metrics:", error);
//     return { error: error.message };
//   }
// }

async function fetchMetricsFromBlockchain() {
  try {
    const db = await connectDB();
    const collection = db.collection("metrics");
    const document = await collection.findOne();

    const updatedMetrics = await Promise.all(
      document.metrics.map(async (metric) => {
        const contractInfo = contracts.find((c) => c.token === metric.token);
        if (!contractInfo) return metric;

        const contract = new ethers.Contract(contractInfo.contractAddress, contractInfo.abi, provider);

        // Run blockchain calls in parallel
        const [MCR, CCR, minDebt, LR, maxMint] = await Promise.all([
          contract.getMcr(contractInfo.assetaddress),
          contract.getCcr(contractInfo.assetaddress),
          contract.getMinNetDebt(contractInfo.assetaddress),
          contract.getDebtTokenGasCompensation(contractInfo.assetaddress),
          contract.getMintCap(contractInfo.assetaddress),
        ]);

        return {
          ...metric,
          MCR: parseFloat(formatUnits(MCR, 18)),
          CCR: parseFloat(formatUnits(CCR, 18)),
          minDebt: parseFloat(formatUnits(minDebt, 18)),
          LR: parseFloat(formatUnits(LR, 18)),
          maxMint: parseFloat(formatUnits(maxMint, 18)),
        };
      })
    );

    await collection.updateOne({ _id: document._id }, { $set: { metrics: updatedMetrics } });
    return updatedMetrics;
  } catch (error) {
    console.error("❌ Error fetching metrics:", error);
    return { error: error.message };
  }
}


module.exports = fetchMetricsFromBlockchain;

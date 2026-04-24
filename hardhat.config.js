require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const isValidPrivateKey = (key) => typeof key === "string" && /^0x[0-9a-fA-F]{64}$/.test(key);
const sepoliaAccounts = isValidPrivateKey(process.env.PRIVATE_KEY)
  ? [process.env.PRIVATE_KEY]
  : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: process.env.RPC_URL || "",
      accounts: sepoliaAccounts,
    },
    hardhat: {
      chainId: 31337,
    }
  },
};

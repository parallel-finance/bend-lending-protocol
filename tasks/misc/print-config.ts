import { task } from "hardhat/config";
import { ConfigNames, loadPoolConfig } from "../../helpers/configuration";
import {
  getBendProtocolDataProvider,
  getLendPoolAddressesProvider,
  getLendPoolAddressesProviderRegistry,
  //getLendPoolAddressesProviderRegistry,
} from "../../helpers/contracts-getters";
import { getParamPerNetwork } from "../../helpers/contracts-helpers";
import { DRE } from "../../helpers/misc-utils";
import { eEthereumNetwork, eNetwork } from "../../helpers/types";

task("print-config", "Print config of all reserves and nfts")
  .addParam("dataProvider", "Address of BendProtocolDataProvider")
  .addParam("pool", `Pool name to retrieve configuration, supported: ${Object.values(ConfigNames)}`)
  .setAction(async ({ pool, dataProvider }, localBRE) => {
    await localBRE.run("set-DRE");
    const network = process.env.FORK ? (process.env.FORK as eNetwork) : (localBRE.network.name as eNetwork);
    const poolConfig = loadPoolConfig(pool);

    const providerRegistryAddress = getParamPerNetwork(poolConfig.ProviderRegistry, network);
    const providerRegistry = await getLendPoolAddressesProviderRegistry(providerRegistryAddress);
    const providers = await providerRegistry.getAddressesProvidersList();
    const addressesProvider = await getLendPoolAddressesProvider(providers[0]); // Checks first provider

    console.log("Provider Registry: ", providerRegistry.address);
    console.log("Address Provider: ", addressesProvider.address);
    console.log("Market Id: ", await addressesProvider.getMarketId());
    console.log("Pool Admin", await addressesProvider.getPoolAdmin());
    console.log("Emergency Admin", await addressesProvider.getEmergencyAdmin());
    console.log("Lend Pool Proxy:", await addressesProvider.getLendPool());
    console.log("Lend Pool Loan Proxy", await addressesProvider.getLendPoolLoan());
    console.log("Lend Pool Configurator Proxy", await addressesProvider.getLendPoolConfigurator());
    console.log("Reserve Oracle Proxy", await addressesProvider.getReserveOracle());
    console.log("NFT Oracle Proxy", await addressesProvider.getNFTOracle());
    console.log("BNFT Registry Proxy", await addressesProvider.getBNFTRegistry());
    console.log("Lend Pool Data Provider", dataProvider);
    const protocolDataProvider = await getBendProtocolDataProvider(dataProvider);

    const reserveFields = ["decimals", "reserveFactor", "borrowingEnabled", "isActive", "isFrozen"];
    const reserveTokensFields = ["bTokenSymbol", "bTokenAddress", "debtTokenSymbol", "debtTokenAddress"];
    const reserveAssets = getParamPerNetwork(poolConfig.ReserveAssets, network as eNetwork);
    for (const [symbol, address] of Object.entries(reserveAssets)) {
      console.log(`- ${symbol} reserve config`);
      console.log(`  - reserve address: ${address}`);

      const reserveData = await protocolDataProvider.getReserveConfigurationData(address);
      const reserveTokenData = await protocolDataProvider.getReserveTokenData(address);

      reserveFields.forEach((field, index) => {
        console.log(`  - ${field}:`, reserveData[field].toString());
      });
      reserveTokensFields.forEach((field, index) => {
        console.log(`  - ${field}:`, reserveTokenData[field].toString());
      });
    }

    const nftFields = ["ltv", "liquidationThreshold", "liquidationBonus", "isActive", "isFrozen"];
    const nftTokensFields = ["bNftSymbol", "bNftAddress"];
    const nftsAsset = getParamPerNetwork(poolConfig.NftsAssets, network as eNetwork);
    for (const [symbol, address] of Object.entries(nftsAsset)) {
      console.log(`- ${symbol} nft config`);
      console.log(`  - nft address: ${address}`);

      const nftData = await protocolDataProvider.getNftConfigurationData(address);
      const nftTokenData = await protocolDataProvider.getNftTokenData(address);

      nftFields.forEach((field, index) => {
        console.log(`  - ${field}:`, nftData[field].toString());
      });
      nftTokensFields.forEach((field, index) => {
        console.log(`  - ${field}:`, nftTokenData[field].toString());
      });
    }
  });
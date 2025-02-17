import * as dotenv from "dotenv";

dotenv.config();

export const ENV = {
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || "0xBB6F3Ee65fd0C6Df66d29b5Ad9F3A8695A638172",
    POSTGRES_USER: process.env.POSTGRES_USER || "freelancer_platform",
    POSTGRES_HOST: process.env.POSTGRES_HOST || "localhost",
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE || "freelancer_platform",
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || "freelancer_platform",
    POSTGRES_PORT: Number(process.env.POSTGRES_PORT) || 5432,
    RPC_URL: process.env.RPC_URL || "https://opbnb-testnet-rpc.bnbchain.org/",
    WORKER_PRIVATE_KEY: process.env.WORKER_PRIVATE_KEY || "",
};

console.log(ENV);

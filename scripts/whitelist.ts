import "dotenv/config";
import Redis from "ioredis";
import chicken_tribe from "./whitelists/chicken_tribe.json";
import exiled_apes from "./whitelists/exiled_apes.json";
import breadheads from "./whitelists/breadheads.json";
import jellybeasts from "./whitelists/jellybeasts.json";

const client = new Redis(process.env.REDIS_URL as string);

async function main() {
  await client.sadd("chicken_tribe", ...chicken_tribe);
  await client.sadd("exiled_apes", ...exiled_apes);
  await client.sadd("breadheads", ...breadheads);
  await client.sadd("jellybeasts", ...jellybeasts);
  await client.sadd(
    "whitelist",
    ...chicken_tribe,
    ...exiled_apes,
    ...breadheads,
    ...jellybeasts
  );
  console.log("done.");
}

main();

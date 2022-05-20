import data from "./daily-txs.json";

interface DataMap {
  [key: string]: number;
}

const dataMap: DataMap = {};

data.reduce((acc, cur) => {
  const [date, amount] = cur as [string, number];
  const curAmount = acc[date.slice(0, 7)] ?? 0;
  acc[date.slice(0, 7)] = curAmount + amount;
  return acc;
}, dataMap);

console.log(JSON.stringify(dataMap, null, 2));

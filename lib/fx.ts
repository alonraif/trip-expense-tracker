export async function getExchangeRate(
  date: string,
  from: string,
  to: string
): Promise<number> {
  if (from === to) return 1;

  const res = await fetch(
    `https://api.frankfurter.dev/v1/${date}?base=${from}&symbols=${to}`
  );

  if (!res.ok) {
    throw new Error(`Exchange rate request failed with status ${res.status}`);
  }

  const data = await res.json();
  const rate = data?.rates?.[to];

  if (typeof rate !== 'number') {
    throw new Error(`No exchange rate available for ${from} to ${to} on ${date}`);
  }

  return rate;
}

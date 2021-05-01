export const generateRandomList = (count: number, max: number) =>
  Array.from({ length: count }, () => Math.floor(Math.random() * max));

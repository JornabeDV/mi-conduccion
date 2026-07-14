export type Denomination = {
  value: number;
  label: string;
};

export const DEFAULT_DENOMINATIONS: Denomination[] = [
  { value: 20, label: "$ 20" },
  { value: 50, label: "$ 50" },
  { value: 100, label: "$ 100" },
  { value: 200, label: "$ 200" },
  { value: 500, label: "$ 500" },
  { value: 1000, label: "$ 1.000" },
  { value: 2000, label: "$ 2.000" },
  { value: 10000, label: "$ 10.000" },
  { value: 20000, label: "$ 20.000" },
];

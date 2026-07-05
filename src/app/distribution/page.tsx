import type { Metadata } from "next";
import { DistributionClientPage } from "./client";

export const metadata: Metadata = {
  title: "Purva Bites Distribution",
  description: "Become a distributor for Purva Bites. Pan-India FMCG distribution network for khakhra, bhakhri, makhana, extruder snacks and digestive biscuits.",
  openGraph: {
    title: "Purva Bites Distribution",
    description: "Become a distributor for Purva Bites. Pan-India FMCG distribution network.",
  },
};

export default function Page() {
  return <DistributionClientPage />;
}

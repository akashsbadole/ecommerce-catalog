import type { Metadata } from "next";
import { DistributionClientPage } from "./client";

export const metadata: Metadata = {
  title: "Purva Bites Distribution | Pan-India FMCG Distribution Network",
  description: "Become a distributor for Purva Bites. Pan-India FMCG distribution network for khakhra, bhakhri, makhana, extruder snacks and digestive biscuits.",
};

export default function Page() {
  return <DistributionClientPage />;
}

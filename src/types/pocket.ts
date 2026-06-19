import type { ObjectId } from "mongodb";
import type { PocketColorKey } from "@/lib/colors";
import type { PocketIconKey } from "@/lib/icons";

export interface Pocket {
  id: string;
  name: string;
  amount: number;
  color: PocketColorKey;
  icon: PocketIconKey;
}

export interface PocketDocument {
  _id?: ObjectId;
  name: string;
  amount: number;
  color: PocketColorKey;
  icon: PocketIconKey;
}

export type PocketInput = Omit<Pocket, "id">;

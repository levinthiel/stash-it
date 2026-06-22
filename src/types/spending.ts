import type { ObjectId } from "mongodb";
import type { PocketColorKey } from "@/lib/colors";

export interface Spending {
  id: string;
  name: string;
  amount: number;
  color: PocketColorKey;
}

export interface SpendingDocument {
  _id?: ObjectId;
  name: string;
  amount: number;
  color: PocketColorKey;
}

export type SpendingInput = Pick<Spending, "name" | "amount">;

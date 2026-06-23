import type { ObjectId } from "mongodb";
import type { PocketColorKey } from "@/lib/colors";

export interface Grocery {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  color: PocketColorKey;
}

export interface GroceryDocument {
  _id?: ObjectId;
  name: string;
  quantity: number;
  checked: boolean;
  color?: PocketColorKey;
}

export type GroceryInput = Pick<Grocery, "name" | "quantity">;

export type GroceryUpdate = Partial<Pick<Grocery, "name" | "quantity" | "checked">>;

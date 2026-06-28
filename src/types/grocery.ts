import type { ObjectId } from "mongodb";
import type { PocketColorKey } from "@/lib/colors";
import type { GroceryStore } from "@/lib/grocery-stores";

export interface Grocery {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
  color: PocketColorKey;
  store: GroceryStore | null;
}

export interface GroceryDocument {
  _id?: ObjectId;
  name: string;
  quantity: number;
  checked: boolean;
  color?: PocketColorKey;
  store?: GroceryStore;
}

export interface GroceryInput {
  name: string;
  quantity: number;
  store?: GroceryStore | null;
}

export type GroceryUpdate = Partial<Pick<Grocery, "name" | "quantity" | "checked" | "store">>;

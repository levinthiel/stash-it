import type { ObjectId } from "mongodb";

export interface Grocery {
  id: string;
  name: string;
  quantity: number;
  checked: boolean;
}

export interface GroceryDocument {
  _id?: ObjectId;
  name: string;
  quantity: number;
  checked: boolean;
}

export type GroceryInput = Pick<Grocery, "name" | "quantity">;

export type GroceryUpdate = Partial<Pick<Grocery, "name" | "quantity" | "checked">>;

import {
  Bank,
  Car,
  CoffeeCup,
  FloppyDisk,
  Gamepad,
  Gift,
  Heart,
  Home,
  PizzaSlice,
  ShoppingBag,
  Wallet,
} from "iconoir-react";
import type { ComponentType, SVGProps } from "react";

export type PocketIconKey =
  | "disk"
  | "wallet"
  | "heart"
  | "home"
  | "gamepad"
  | "coffee"
  | "pizza"
  | "shopping"
  | "car"
  | "bank"
  | "gift";

export const pocketIcons: {
  key: PocketIconKey;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { key: "disk", label: "Disk", Icon: FloppyDisk },
  { key: "wallet", label: "Wallet", Icon: Wallet },
  { key: "heart", label: "Heart", Icon: Heart },
  { key: "home", label: "Home", Icon: Home },
  { key: "gamepad", label: "Gamepad", Icon: Gamepad },
  { key: "coffee", label: "Coffee", Icon: CoffeeCup },
  { key: "pizza", label: "Pizza", Icon: PizzaSlice },
  { key: "shopping", label: "Shopping", Icon: ShoppingBag },
  { key: "car", label: "Car", Icon: Car },
  { key: "bank", label: "Bank", Icon: Bank },
  { key: "gift", label: "Gift", Icon: Gift },
];

export function getPocketIcon(key: PocketIconKey) {
  return pocketIcons.find((i) => i.key === key) ?? pocketIcons[0];
}

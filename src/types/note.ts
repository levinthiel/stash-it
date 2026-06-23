import type { ObjectId } from "mongodb";
import type { PocketColorKey } from "@/lib/colors";

export interface Note {
  id: string;
  title: string;
  body: string;
  color: PocketColorKey;
  updatedAt: string;
}

export interface NoteDocument {
  _id?: ObjectId;
  title: string;
  body: string;
  color?: PocketColorKey;
  updatedAt?: string;
}

export type NoteInput = Pick<Note, "title" | "body">;

export type NoteUpdate = Partial<NoteInput>;

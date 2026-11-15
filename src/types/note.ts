import type { ObjectId } from "mongodb";
import type { PocketColorKey } from "@/lib/colors";

export interface Note {
  id: string;
  title: string;
  body: string; // markdown source, stored verbatim
  color?: PocketColorKey;
  folder: string | null; // null => "Unsorted"; "/" reserved for future nesting
  pinned: boolean;
  pinnedAt: string | null; // ISO timestamp of the most recent pin action
  updatedAt: string;
}

export interface NoteDocument {
  _id?: ObjectId;
  title: string;
  body: string;
  color?: PocketColorKey;
  folder?: string | null;
  pinned?: boolean;
  pinnedAt?: string | null;
  updatedAt?: string;
}

export interface NoteInput {
  title: string;
  body: string;
  color?: PocketColorKey;
  folder?: string | null;
}

export type NoteUpdate = Partial<NoteInput> & {
  pinned?: boolean;
};

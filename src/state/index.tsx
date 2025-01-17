import { atom } from "jotai";
import currentYear from "../services/currentYear";

export const nameAtom = atom(localStorage.getItem("name"));

export const yearAtom = atom(currentYear);

export const exportingAtom = atom(false);

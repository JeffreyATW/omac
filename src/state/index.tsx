import { atom } from "jotai";
import { CURRENT_YEAR } from "../services/constants";

export const nameAtom = atom(localStorage.getItem("name"));

export const yearAtom = atom(CURRENT_YEAR);

export const exportingAtom = atom(false);

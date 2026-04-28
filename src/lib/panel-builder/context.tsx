"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { BtnData, MediaItemData, CompType, CompData, ContainerData } from "./types";

interface State { containers: ContainerData[]; }

type Action =
  | { type: "ADD_CONTAINER" }
  | { type: "DELETE_CONTAINER"; cid: string }
  | { type: "MOVE_CONTAINER"; from: number; to: number }
  | { type: "SET_CONTAINER_ACCENT"; cid: string; color: number | null }
  | { type: "SET_CONTAINER_SPOILER"; cid: string; v: boolean }
  | { type: "ADD_COMPONENT"; cid: string; compType: CompType }
  | { type: "DELETE_COMPONENT"; cid: string; compId: string }
  | { type: "MOVE_COMPONENT"; cid: string; from: number; to: number }
  | { type: "SET_CONTENT"; cid: string; compId: string; content: string }
  | { type: "SET_FILE_URL"; cid: string; compId: string; url: string }
  | { type: "SET_FILE_SPOILER"; cid: string; compId: string; v: boolean }
  | { type: "SET_DIVIDER"; cid: string; compId: string; v: boolean }
  | { type: "SET_SPACING"; cid: string; compId: string; v: 1 | 2 }
  | { type: "ADD_BUTTON"; cid: string; compId: string }
  | { type: "ADD_PREFILLED_BUTTON"; cid: string; compId: string; button: BtnData }
  | { type: "DELETE_BUTTON"; cid: string; compId: string; btnId: string }
  | { type: "SET_BUTTON_FIELD"; cid: string; compId: string; btnId: string; field: keyof BtnData; value: unknown }
  | { type: "ADD_MEDIA_ITEM"; cid: string; compId: string }
  | { type: "DELETE_MEDIA_ITEM"; cid: string; compId: string; itemId: string }
  | { type: "SET_MEDIA_FIELD"; cid: string; compId: string; itemId: string; field: keyof MediaItemData; value: unknown }
  | { type: "LOAD_JSON"; containers: ContainerData[] }
  | { type: "CLEAR_ALL" };

function newComp(compType: CompType): CompData {
  return { id: uuidv4(), type: compType, content: "", buttons: [], items: [], fileUrl: "", fileSpoiler: false, divider: true, spacing: 1 };
}
function newBtn(): BtnData {
  return { id: uuidv4(), style: 1, label: "Botão", emoji: "", custom_id: uuidv4(), url: "", disabled: false };
}
function mapContainers(containers: ContainerData[], cid: string, fn: (c: ContainerData) => ContainerData): ContainerData[] {
  return containers.map((c) => (c.id === cid ? fn(c) : c));
}
function mapComponents(containers: ContainerData[], cid: string, compId: string, fn: (comp: CompData) => CompData): ContainerData[] {
  return mapContainers(containers, cid, (c) => ({ ...c, components: c.components.map((comp) => (comp.id === compId ? fn(comp) : comp)) }));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_CONTAINER": return { containers: [...state.containers, { id: uuidv4(), accentColor: null, spoiler: false, components: [] }] };
    case "DELETE_CONTAINER": return { containers: state.containers.filter((c) => c.id !== action.cid) };
    case "MOVE_CONTAINER": {
      const { from, to } = action;
      if (to < 0 || to >= state.containers.length) return state;
      const arr = [...state.containers]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return { containers: arr };
    }
    case "SET_CONTAINER_ACCENT": return { containers: mapContainers(state.containers, action.cid, (c) => ({ ...c, accentColor: action.color })) };
    case "SET_CONTAINER_SPOILER": return { containers: mapContainers(state.containers, action.cid, (c) => ({ ...c, spoiler: action.v })) };
    case "ADD_COMPONENT": return { containers: mapContainers(state.containers, action.cid, (c) => ({ ...c, components: [...c.components, newComp(action.compType)] })) };
    case "DELETE_COMPONENT": return { containers: mapContainers(state.containers, action.cid, (c) => ({ ...c, components: c.components.filter((comp) => comp.id !== action.compId) })) };
    case "MOVE_COMPONENT": {
      const { cid, from, to } = action;
      return { containers: mapContainers(state.containers, cid, (c) => { if (to < 0 || to >= c.components.length) return c; const arr = [...c.components]; const [item] = arr.splice(from, 1); arr.splice(to, 0, item); return { ...c, components: arr }; }) };
    }
    case "SET_CONTENT": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, content: action.content })) };
    case "SET_FILE_URL": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, fileUrl: action.url })) };
    case "SET_FILE_SPOILER": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, fileSpoiler: action.v })) };
    case "SET_DIVIDER": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, divider: action.v })) };
    case "SET_SPACING": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, spacing: action.v })) };
    case "ADD_BUTTON": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, buttons: [...comp.buttons, newBtn()] })) };
    case "ADD_PREFILLED_BUTTON": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, buttons: [...comp.buttons, action.button] })) };
    case "DELETE_BUTTON": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, buttons: comp.buttons.filter((b) => b.id !== action.btnId) })) };
    case "SET_BUTTON_FIELD": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, buttons: comp.buttons.map((b) => b.id === action.btnId ? { ...b, [action.field]: action.value } : b) })) };
    case "ADD_MEDIA_ITEM": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, items: [...comp.items, { id: uuidv4(), url: "", description: "", spoiler: false }] })) };
    case "DELETE_MEDIA_ITEM": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, items: comp.items.filter((i) => i.id !== action.itemId) })) };
    case "SET_MEDIA_FIELD": return { containers: mapComponents(state.containers, action.cid, action.compId, (comp) => ({ ...comp, items: comp.items.map((i) => i.id === action.itemId ? { ...i, [action.field]: action.value } : i) })) };
    case "LOAD_JSON": return { containers: action.containers };
    case "CLEAR_ALL": return { containers: [] };
    default: return state;
  }
}

interface Ctx { state: State; dispatch: React.Dispatch<Action>; getJSON: () => object[]; }
const BuilderContext = createContext<Ctx | null>(null);

export function BuilderProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { containers: [] });
  const getJSON = useCallback((): object[] => {
    return state.containers.map((c) => ({
      type: 17, accent_color: c.accentColor, spoiler: c.spoiler,
      components: c.components.map((comp) => {
        switch (comp.type) {
          case 10: if (!comp.content.trim()) return null; return { type: 10, content: comp.content };
          case 1: if (comp.buttons.length === 0) return null; return { type: 1, components: comp.buttons.map((b) => { const emoji = b.emoji ? { id: null, name: b.emoji } : null; return b.style === 5 ? { type: 2, style: 5, label: b.label || "Botão", emoji, disabled: b.disabled, url: b.url } : { type: 2, style: b.style, label: b.label || "Botão", emoji, disabled: b.disabled, custom_id: b.custom_id }; }) };
          case 12: { const items = comp.items.filter((i) => i.url.trim()).map((i) => ({ media: { url: i.url }, description: i.description || null, spoiler: i.spoiler })); if (items.length === 0) return null; return { type: 12, items }; }
          case 13: if (!comp.fileUrl.trim()) return null; return { type: 13, file: { url: comp.fileUrl }, spoiler: comp.fileSpoiler };
          case 14: return { type: 14, divider: comp.divider, spacing: comp.spacing };
          default: return null;
        }
      }).filter(Boolean),
    }));
  }, [state]);
  return <BuilderContext.Provider value={{ state, dispatch, getJSON }}>{children}</BuilderContext.Provider>;
}

export function useBuilder() {
  const ctx = useContext(BuilderContext);
  if (!ctx) throw new Error("useBuilder must be used inside BuilderProvider");
  return ctx;
}

export type { ContainerData, CompData, BtnData, MediaItemData, CompType };

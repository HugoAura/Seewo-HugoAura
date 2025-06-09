import { WindowName } from "../main/core";

interface UIHookTarget {
  active?: boolean;
  pageURI?: string;
  pageScript?: string;
  pageSelector?: string;
  selectorMode?: "insertAfter" | "insertBefore" | "appendChild";
  pageCSS?: string;
  childs?: Record<AuraElementUID, UIHookTarget>;
  revive?: boolean;
}

type AuraElementUID = string;
type OnLoadedEvalJS = string;

interface UIHookConfig {
  targets: Record<AuraElementUID, UIHookTarget>;
  globalStyles: string[];
  globalJS: string[];
  onLoaded: OnLoadedEvalJS;
}

interface UIHookConfigFin extends UIHookConfig {
  windowName: WindowName;
}

type UIHooksObject = Record<AuraElementUID, UIHookConfigFin>;

import { IpcRenderer } from "electron";
import type EventBus from "../../utils/eventBus";
import { HookedWindowsMap, UIHooksMap, WindowHooksMap } from "../main/core";
import { UIHooksObject } from "../render/uiHook";
import ConfigManager from "../../init/shared/configManager";
import { PLSStatus } from "./pls/status";

type MainProcessOnlyVal<T> = T;
type RendererProcessOnlyVal<T> = T;

interface GlobalHugoAuraInfo {
  central?: MainProcessOnlyVal<(...args: any) => any>;
  configInit: boolean;
  hookedWindows?: MainProcessOnlyVal<HookedWindowsMap>;
  ipcInit?: MainProcessOnlyVal<boolean>;
  plsRules?: Record<any, any> | null;
  plsSettings?: Record<any, any> | null;
  plsStats?: PLSStatus | null;
  plsWs?: RendererProcessOnlyVal<WebSocket>;
  uiHooks?: MainProcessOnlyVal<UIHooksMap>;
  windowHooks?: MainProcessOnlyVal<WindowHooksMap>;
  version: RendererProcessOnlyVal<string>;
}

type GlobalHugoAuraConfig = AuraConfig;

declare global {
  var ipcRenderer: RendererProcessOnlyVal<IpcRenderer>;
  var __HUGO_AURA__: GlobalHugoAuraInfo;
  var __HUGO_AURA_CONFIG__: GlobalHugoAuraConfig;
  var __HUGO_AURA_CONFIG_MGR__: ConfigManager;
  var __HUGO_AURA_EVENT_BUS__: EventBus;
  var __HUGO_AURA_DEBUG__: RendererProcessOnlyVal<Record<any, any>>;
  var __HUGO_AURA_GLOBAL__: RendererProcessOnlyVal<Record<any, any>>;
  var __HUGO_AURA_HOOK__: RendererProcessOnlyVal<Record<any, any>>;
  var __HUGO_AURA_LOADER__: RendererProcessOnlyVal<UIHooksObject>;
  var __HUGO_AURA_UI_FUNCTIONS__: RendererProcessOnlyVal<UIFunctionsObject>;
  var __HUGO_AURA_UI_REACTIVES__: RendererProcessOnlyVal<UIReactivesObject>;
}

import { WebContents } from "electron";

type SeewoHugoCentralLambda = any;
type SeewoHugoGlobalConfig = Record<any, any>;

type WindowName = string;

interface LauncherArgs {
  central: SeewoHugoCentralLambda;
  windowName: WindowName;
  config: SeewoHugoGlobalConfig;
}

interface HookedWindow {
  webContents: WebContents;
  domReadyListener: any;
  destroyedListener: any;
}

type HookedWindowsMap = Map<WindowName, HookedWindow>;

type HookRequire = any;

type UIHooksMap = Map<WindowName, HookRequire>;

type WindowHooksMap = Map<WindowName, HookRequire>;

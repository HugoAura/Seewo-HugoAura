import { RendererProcessOnlyVal } from "../global";

interface PLSStatus {
  installed: boolean;
  detached: boolean;
  connected: boolean;
  launched: boolean;
  status: string;
  version: string;
  authToken: string;
}

type PLSLifecycleType = "isDetached" | "isSvcInstalled" | "isSvcStart";

type PLSLifecycleControlType = "instSvc" | "rmSvc" | "startSvc" | "stopSvc";

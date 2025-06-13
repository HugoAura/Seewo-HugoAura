import { RendererProcessOnlyVal } from "../global";

type PLSStatusDesc =
  | "dead"
  | "running"
  | "notReady"
  | "downloading"
  | "notInstalled";

interface PLSStatus {
  installed: boolean;
  detached: boolean;
  connected: boolean;
  launched: boolean;
  status: PLSStatusDesc;
  version: string;
  authToken: string;
}

type PLSLifecycleType = "isDetached" | "isSvcInstalled" | "isSvcStart";

type PLSLifecycleControlType =
  | "instSvc"
  | "rmSvc"
  | "startSvc"
  | "stopSvc"
  | "rmBin"
  | "dlBin";

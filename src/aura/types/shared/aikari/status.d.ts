import { RendererProcessOnlyVal } from "../global";

type AikariStatusDesc =
  | "dead"
  | "running"
  | "notReady"
  | "downloading"
  | "installing"
  | "notInstalled";

interface AikariStatus {
  installed: boolean;
  detached: boolean;
  connected: boolean;
  launched: boolean;
  status: AikariStatusDesc;
  version: string;
  authToken: string;
}

type AikariLifecycleType = "isDetached" | "isSvcInstalled" | "isSvcStart";

type AikariLifecycleControlType =
  | "instSvc"
  | "uninstSvc"
  | "startSvc"
  | "stopSvc"
  | "uninst"
  | "inst";

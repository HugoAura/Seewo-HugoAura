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

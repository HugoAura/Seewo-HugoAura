import { IpcMain, WebContents } from "electron";

interface AuraIPCMain extends IpcMain {
  send: (
    windowKey: string,
    channel: string,
    data: any,
    grep?: WebContents
  ) => void;
}

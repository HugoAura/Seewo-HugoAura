type DownloadTaskID = string;
type DownloadTaskStatus = "waiting" | "progressing" | "done" | "failed" | "cancelled";

interface DownloadTask {
  id: DownloadTaskID;
  progress: float;
  curBytes?: number;
  totalBytes?: number;
  status: DownloadTaskStatus;
  dlUrl: string | null;
  savePath: string | null;
  message?: string;
  errorObj?: Error;
}

interface FSTasks {
  downloadTasks: Map<
    DownloadTaskID,
    { status: DownloadTaskStatus; cancelReq: any }
  >;
}

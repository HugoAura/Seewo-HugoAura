// @ts-check

const __SCOPE = "main";

const { exec } = require("child_process");
const nodeHttp = require("http");
const nodeHttps = require("https");
const fs = require("fs");
const path = require("path");

const { genRandomHex } = require("../../../utils/crypto");

const composableFunctions = {
  /**
   *
   * @param {string} url
   * @param {string} targetPath
   * @param {((arg: DownloadTask) => any)} progressCallback
   */
  downloadFile: async (url, targetPath, progressCallback) => {
    if (!progressCallback) return false;
    const taskId = genRandomHex();

    /**
     * @type {DownloadTask}
     */
    const failedTemplate = {
      id: taskId,
      progress: 100,
      status: "failed",
      dlUrl: url,
      savePath: targetPath,
      message: "",
    };

    if (!url || !targetPath) {
      failedTemplate.message = "Invalid arg";
      progressCallback(failedTemplate);
      return false;
    }
    if (!fs.existsSync(path.dirname(targetPath))) {
      failedTemplate.message = "Path not exists";
      progressCallback(failedTemplate);
    }
    const httpModuleIns = url.startsWith("https") ? nodeHttps : nodeHttp;

    global.__HUGO_AURA__.fsTasks?.downloadTasks.set(taskId, {
      status: "waiting",
      cancelReq: null,
    });

    const fsStream = fs.createWriteStream(targetPath);

    const dlReq = httpModuleIns.get(url, (response) => {
      if (response.statusCode !== 200) {
        fsStream.close();
        failedTemplate.message = `Request error: HTTP ${response.statusCode}`;
        progressCallback(failedTemplate);
        return false;
      }

      const contentLength = response.headers["content-length"];
      // @ts-expect-error
      const totalBytes = parseInt(contentLength, 10) || 0; // No error handling 😆
      let curRecvBytes = 0;

      global.__HUGO_AURA__.fsTasks?.downloadTasks.set(taskId, {
        status: "progressing",
        cancelReq: () => {
          dlReq.destroy();
          fsStream.close();
          fs.unlink(targetPath, () => {});
          global.__HUGO_AURA__.fsTasks?.downloadTasks.delete(taskId);
          progressCallback({
            id: taskId,
            progress: 100,
            curBytes: curRecvBytes,
            totalBytes: totalBytes,
            status: "cancelled",
            dlUrl: url,
            savePath: targetPath,
          });
        },
      });

      response.on("data", (chunk) => {
        curRecvBytes += chunk.length;
        const curProgress =
          totalBytes > 0 ? (curRecvBytes / totalBytes) * 100 : 0;
        progressCallback({
          id: taskId,
          progress: curProgress.toFixed(2),
          curBytes: curRecvBytes,
          totalBytes: totalBytes,
          status: "progressing",
          dlUrl: url,
          savePath: targetPath,
        });
      });

      response.pipe(fsStream);

      fsStream.on("finish", () => {
        fsStream.close();
        progressCallback({
          id: taskId,
          progress: (100).toFixed(2),
          curBytes: curRecvBytes,
          totalBytes: totalBytes,
          status: "done",
          dlUrl: url,
          savePath: targetPath,
        });
      });

      global.__HUGO_AURA__.fsTasks?.downloadTasks.delete(taskId);
      return true;
    });

    dlReq.on("error", (e) => {
      fsStream.close();
      fs.unlink(targetPath, () => {});
      failedTemplate.message =
        "Request error: Unexpected error while downloading file";
      failedTemplate.errorObj = e;
      progressCallback(failedTemplate);
      global.__HUGO_AURA__.fsTasks?.downloadTasks.delete(taskId);
      return false;
    });
  },
};

/**
 *
 * @param {import("electron").IpcMain} ipcMain
 */
const applyFsIpcHandler = (ipcMain) => {
  const methodBase = "$aura.fs";

  global.__HUGO_AURA__.fsTasks = {
    downloadTasks: new Map(),
  };

  ipcMain.handle(
    `${methodBase}.dl.cancelDownloadTask`,
    /**
     *
     * @param {import("electron").IpcMainInvokeEvent} _evt
     * @param {{ targetTaskId: string }} arg
     * @returns {{ success: boolean, error: string | null }}
     */
    (_evt, arg) => {
      if (!arg.targetTaskId) {
        return {
          success: false,
          error: "ARG_INVALID",
        };
      }

      if (!global.__HUGO_AURA__.fsTasks?.downloadTasks.has(arg.targetTaskId)) {
        return {
          success: false,
          error: "TASK_ID_NOT_FOUND",
        };
      }

      const taskObj = global.__HUGO_AURA__.fsTasks.downloadTasks.get(
        arg.targetTaskId
      );
      if (!taskObj?.cancelReq) {
        return {
          success: false,
          error: "TASK_NOT_STARTED",
        };
      }

      taskObj.cancelReq();
      return {
        success: true,
        error: null,
      };
    }
  );
};

module.exports = { fsComposables: composableFunctions, applyFsIpcHandler };

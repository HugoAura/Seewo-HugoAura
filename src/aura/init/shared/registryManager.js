// @ts-check

const childProc = require("child_process");

// Constants

const LOG_PREFIX = "[HugoAura / Init / Reg";
const LOG_PREFIX_FUNC = "[HugoAura / Reg";
const AURA_REGISTRY_PATH = ["HKCU", "SOFTWARE", "HugoAura"].join("\\");

class RegistryManager {
  /**
   * @param {string} [path]
   */
  handleCreateReg(path) {
    try {
      const createResult = childProc.execSync(["reg", "add", path].join(" "), {
        encoding: "utf8",
      });

      if (createResult) {
        console.log(
          `${LOG_PREFIX} / SUCCESS] Registry path ${path} successfully created.`
        );
        console.debug(
          `${LOG_PREFIX} / DEBUG] Reg add command stdout:`,
          createResult
        );
        return true;
      }
    } catch (e) {
      console.error(
        `${LOG_PREFIX} / ERROR] Failed creating registry path, error:`,
        e
      );
      return false;
    }
  }

  initRegistry() {
    try {
      const queryResult = childProc.execSync(
        ["reg", "query", AURA_REGISTRY_PATH].join(" "),
        { encoding: "utf8" }
      );

      if (queryResult) {
        console.log(`${LOG_PREFIX}] Registry check up success.`);
        console.debug(`${LOG_PREFIX}] Command stdout:`, queryResult);
        return true;
      }
    } catch (e) {
      console.warn(`${LOG_PREFIX} / WARN] Failed to query registry, error:`, e);
      return this.handleCreateReg(AURA_REGISTRY_PATH);
    }
  }

  /**
   *
   * @param {string} relativePath
   * @param {string} keyName
   * @param {string} keyVal
   * @param {boolean | undefined} silent
   */
  createOrUpdateRegKey(relativePath, keyName, keyVal, silent = false) {
    try {
      const result = childProc.execSync(
        [
          "reg",
          "add",
          [AURA_REGISTRY_PATH, relativePath].join("\\"),
          "/v",
          keyName,
          "/t",
          "REG_SZ",
          "/d",
          `\"${keyVal}\"`,
          "/f",
        ].join(" "),
        { encoding: "utf8" }
      );

      if (result) {
        if (!silent) {
          console.debug(
            `${LOG_PREFIX_FUNC} / SUCCESS] Successfully created / updated reg key ${relativePath}/${keyName} with data: ${keyVal}`
          );
          console.debug(
            `${LOG_PREFIX_FUNC} / SUCCESS] Add key command stdout:`,
            result
          );
        }
        return {
          success: true,
          error: null,
        };
      }
    } catch (e) {
      console.error(
        `${LOG_PREFIX_FUNC} / ERROR] Failed to create / update reg key, error:`,
        silent ? "<Hidden>" : e
      );
      return {
        success: false,
        error: e,
      };
    }
  }

  /*>>> BUC <<<
  keyName === null --> delete the whole entry
  >>> EUC <<<*/
  /**
   *
   * @param {string} relativePath
   * @param {string | null} keyName
   * @param {boolean | undefined} silent
   */
  delRegKey(relativePath, keyName, silent = false) {
    if (keyName === undefined) {
      throw new Error(
        `${LOG_PREFIX_FUNC} / CRITICAL] Arg \"keyName\" for function \"delRegKey\" cannot be undefined. Only null or string accepted.`
      );
    }

    try {
      const result = childProc.execSync(
        [
          "reg",
          "delete",
          [AURA_REGISTRY_PATH, relativePath].join("\\"),
          keyName ? "/v" : "",
          keyName ? keyName : "",
          "/f",
        ].join(" "),
        { encoding: "utf8" }
      );

      if (result) {
        if (!silent) {
          console.debug(
            `${LOG_PREFIX_FUNC} / SUCCESS] Successfully deleted reg key ${relativePath}/${keyName}`
          );
          console.debug(
            `${LOG_PREFIX_FUNC} / SUCCESS] Delete key command stdout:`,
            result
          );
        }
        return {
          success: true,
          error: null,
        };
      }
    } catch (e) {
      console.error(
        `${LOG_PREFIX_FUNC} / ERROR] Failed to delete reg key, error:`,
        silent ? "<Hidden>" : e
      );
      return {
        success: false,
        error: e,
      };
    }
  }

  /**
   *
   * @param {string} relativePath
   * @param {string} keyName
   * @param {boolean | undefined} silent
   */
  readRegKey(relativePath, keyName, silent = false) {
    try {
      const readResult = childProc.execSync(
        [
          "reg",
          "query",
          [AURA_REGISTRY_PATH, relativePath].join("\\"),
          "/v",
          `\"${keyName}\"`,
        ].join(" "),
        { encoding: "utf8" }
      );

      if (readResult) {
        if (!silent) {
          console.debug(
            `${LOG_PREFIX}] Successfully read reg key ${relativePath}/${keyName}, stdout:`,
            readResult
          );
        }
        const match = readResult.match(/REG_SZ\s+(.+)/);

        if (!match) {
          console.warn(`${LOG_PREFIX_FUNC} / WARN] Data not found in stdout`);
          return {
            success: false,
            data: null,
            error: new Error("Data not found"),
          };
        }

        const data = match[1].trim();
        return {
          success: true,
          data,
          error: null,
        };
      }
    } catch (e) {
      console.error(
        `${LOG_PREFIX_FUNC} / ERROR] Failed to read reg key, error:`,
        silent ? "<Hidden>" : e
      );
      return {
        success: false,
        data: null,
        error: e,
      };
    }
  }
}

module.exports = RegistryManager;

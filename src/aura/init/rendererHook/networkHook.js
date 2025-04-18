const fs = require("fs");
const path = require("path");
const os = require("os");

class NetworkHook {
  ruleCache = new Map();

  loadRewriteRules(config) {
    const networkConfig = config.networkRewrite || {};
    const rules = [];

    Object.entries(networkConfig).forEach(([rulePath, ruleConfig]) => {
      if (this.ruleCache.has(rulePath) && !ruleConfig.enabled) {
        console.log(
          `[HugoAura / NetworkHook] Skipping disabled rule: ${rulePath}`
        );
        return;
      }

      try {
        let rule = this.ruleCache.get(rulePath);

        if (!rule) {
          rule = require(path.join(
            __dirname,
            "../../../aura/jsRewrite/network",
            rulePath
          ));
          this.ruleCache.set(rulePath, rule);
        }

        if (ruleConfig.enabled) {
          rules.push({
            id: rulePath,
            type: rule.type, // 'localResource' or 'networkRequest'
            urlPattern: rule.urlPattern,
            requestHook: rule.requestHook || null,
            responseHook: rule.responseHook || null,
            beginOfHook: rule.beginOfHook || null,
            endOfHook: rule.endOfHook || null,
            hookedContent: rule.hookedContent || null,
            hookedContentFunc: rule.hookedContentFunc || null,
          });
          console.log(`[HugoAura / NetworkHook] Loaded rule: ${rulePath}`);
        }
      } catch (err) {
        console.error(
          `[HugoAura / NetworkHook] Failed to load rule ${rulePath}:`,
          err
        );
      }
    });

    return rules;
  }

  installHook(session, config) {
    const rules = this.loadRewriteRules(config);
    if (rules.length === 0) return;

    session.webRequest.onBeforeRequest(
      { urls: ["*://*/*", "file://*"] },
      (details, callback) => {
        let modified = false;
        let redirectURL = null;
        let newBody = null;

        if (details.url.includes("hugo-aura-temp")) {
          callback({});
          return;
        }

        for (const rule of rules) {
          if (this.matchUrl(rule.urlPattern, details.url)) {
            console.log(
              `[HugoAura / NetworkHook] Rule ${rule.id} matched URL: ${details.url}`
            );

            if (
              rule.type === "localResource" &&
              details.url.startsWith("file://")
            ) {
              console.log(
                `[HugoAura / NetworkHook] Processing rule ${rule.id}, mode: localResource`
              );
              modified = true;
              redirectURL = this.processLocalResource(
                rule,
                details
              ).redirectURL;
            } else if (rule.type === "networkRequest" && rule.requestHook) {
              console.log(
                `[HugoAura / NetworkHook] Processing rule ${rule.id}, mode: networkRequest`
              );
              try {
                const originalRequest = JSON.parse(JSON.stringify(details));
                const result = rule.requestHook(originalRequest);

                if (result) {
                  if (result.redirectURL) {
                    redirectURL = result.redirectURL;
                    modified = true;
                  }

                  if (result.requestBody) {
                    newBody = result.requestBody;
                    modified = true;
                  }
                }
              } catch (err) {
                console.error(
                  `[HugoAura / NetworkHook] Error in request hook:`,
                  err
                );
              }
            }

            if (modified) break;
          }
        }

        if (modified && redirectURL) {
          callback({ redirectURL });
        } else if (modified && newBody) {
          callback({ requestBody: newBody });
        } else {
          callback({});
        }
      }
    );

    session.webRequest.onHeadersReceived(
      { urls: ["*://*/*", "file://*"] },
      (details, callback) => {
        for (const rule of rules) {
          if (
            rule.type === "networkRequest" &&
            rule.responseHook &&
            this.matchUrl(rule.urlPattern, details.url)
          ) {
            try {
              const originalResponse = JSON.parse(JSON.stringify(details));
              const result = rule.responseHook(originalResponse);

              if (result && result.responseHeaders) {
                callback({ responseHeaders: result.responseHeaders });
                return;
              }
            } catch (err) {
              console.error(
                `[HugoAura / NetworkHook] Error in response hook:`,
                err
              );
            }
          }
        }

        callback({});
      }
    );
  }

  processLocalResource(rule, details) {
    try {
      const filePath = new URL(details.url).pathname;
      const normalizedPath = decodeURIComponent(
        process.platform === "win32" ? filePath.substring(1) : filePath
      );

      if (fs.existsSync(normalizedPath)) {
        let content = fs.readFileSync(normalizedPath, "utf8");

        if (
          (rule.beginOfHook || rule.beginOfHookRegex) &&
          (rule.endOfHook || rule.endOfHookRegex) &&
          (rule.hookedContent || rule.hookedContentFunc)
        ) {
          let startIdx = -1,
            endIdx = -1;

          if (rule.beginOfHookRegex) {
            const beginRegex = new RegExp(rule.beginOfHookRegex);
            const beginMatch = content.match(beginRegex);
            if (beginMatch) {
              startIdx = beginMatch.index;
            }
          } else if (rule.beginOfHook) {
            startIdx = content.indexOf(rule.beginOfHook);
          }

          if (rule.endOfHookRegex) {
            const endRegex = new RegExp(rule.endOfHookRegex);
            const endContent = content.substring(startIdx);
            const endMatch = endContent.match(endRegex);
            if (endMatch) {
              endIdx = startIdx + endMatch.index + endMatch[0].length;
            }
          } else if (rule.endOfHook) {
            const endContent = content.substring(startIdx);
            const relativeEndIdx = endContent.indexOf(rule.endOfHook);
            if (relativeEndIdx !== -1) {
              endIdx = startIdx + relativeEndIdx + rule.endOfHook.length;
            }
          }

          if (startIdx !== -1 && endIdx !== -1) {
            let beginHook =
              rule.beginOfHook ||
              (rule.beginOfHookRegex
                ? content.substring(
                    startIdx,
                    startIdx + content.substring(startIdx).search(/[;\s{]/)
                  )
                : "");

            let endHook =
              rule.endOfHook ||
              (rule.endOfHookRegex
                ? content.substring(
                    endIdx,
                    endIdx + content.substring(endIdx).search(/[;\s{]/)
                  )
                : "");

            let hookContent;
            if (rule.hookedContentFunc) {
              hookContent = rule.hookedContentFunc
                .toString()
                .match(/{([\s\S]*)}/)[1]
                .trim();
            } else {
              hookContent = rule.hookedContent;
            }

            hookContent = this.minifyCode(hookContent);

            content =
              content.substring(0, startIdx) +
              beginHook +
              hookContent +
              endHook +
              content.substring(endIdx);

            const tempDir = path.join(os.tmpdir(), "hugo-aura-temp");
            if (!fs.existsSync(tempDir)) {
              fs.mkdirSync(tempDir, { recursive: true });
            }

            const tempFile = path.join(tempDir, path.basename(normalizedPath));
            fs.writeFileSync(tempFile, content, "utf8");

            return {
              redirectURL: `file://${
                process.platform === "win32" ? "/" : ""
              }${encodeURI(tempFile.replace(/\\/g, "/"))}`, // Seewo Hugo is still on Node 12 / Electron 8  TwT
            };
          } else {
            console.warn(
              `[HugoAura / NetworkHook] Could not find match points in file: ${normalizedPath}`
            );
            return undefined;
          }
        } else {
          console.error(
            `[HugoAura / NetworkHook] Error processing rule:`,
            rule
          );
        }
      } else {
        console.error(
          `[HugoAura / NetworkHook] Error processing local file: normalizedPath not exists`,
          normalizedPath
        );
      }
    } catch (err) {
      console.error(
        `[HugoAura / NetworkHook] Error processing local file:`,
        err
      );
      return null;
    }
  }

  minifyCode(code) {
    return code.replace(/\s+/g, " ").trim();
  }

  matchUrl(pattern, url) {
    if (typeof pattern === "string") {
      return url.includes(pattern);
    } else if (pattern instanceof RegExp) {
      return pattern.test(url);
    } else if (typeof pattern === "function") {
      return pattern(url);
    }
    return false;
  }
}

module.exports = NetworkHook;

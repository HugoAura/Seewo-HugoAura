(() => {
  const waitForElement = (selector, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(selector)) {
        return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver((mutations) => {
        if (document.querySelector(selector)) {
          observer.disconnect();
          resolve(document.querySelector(selector));
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        reject("[HugoAura / UI / Injection] Timeout waiting for element");
      }, timeout);
    });
  };

  const createStore = () => {
    const store = {
      router: "/",
    };
    const internal = {
      get: (key) => store[key],
      set: (key, value) => {
        store[key] = value;
        return true;
      },
    };

    window.$store = {
      get: (key) => {
        const stack = new Error().stack;
        if (stack.includes("aura/ui/pages/")) {
          return internal.get(key);
        }
        return undefined;
      },
      set: (key, value) => {
        const stack = new Error().stack;
        if (stack.includes("aura/ui/pages/")) {
          return internal.set(key, value);
        }
        return false;
      },
    };

    return internal;
  };

  const store = createStore();

  const createUILoader = () => {
    const modules = "__TEMPLATE_TARGETS__";
    const containers = new Map();
    const observers = new Map();
    const moduleResources = new Map();
    const globalScripts = new Set();

    const insertElement = (target, element, mode = "appendChild") => {
      const elementId = element.id;
      if (document.getElementById(elementId)) {
        console.log(
          `[HugoAura / UI / Warning] Element ${elementId} already exists, skipping insertion`
        );
        return;
      }

      switch (mode) {
        case "insertBefore":
          target.parentNode.insertBefore(element, target);
          break;
        case "insertAfter":
          target.parentNode.insertBefore(element, target.nextSibling);
          break;
        case "appendChild":
        default:
          target.appendChild(element);
      }
    };

    const loadGlobalJS = async () => {
      const scripts = "__TEMPLATE_GLOBAL_JS__";
      for (const scriptPath of scripts) {
        try {
          const script = document.createElement("script");
          script.src = `../../aura/${scriptPath}`;
          document.body.appendChild(script);
          globalScripts.add(script);
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
          });
          console.log(
            `[HugoAura / UI / Global] Loaded global script: ${scriptPath}`
          );
        } catch (err) {
          console.error(
            `[HugoAura / UI / Error] Failed to load global script ${scriptPath}:`,
            err
          );
        }
      }
    };

    const monitorParent = (moduleKey, target, _mode) => {
      if (observers.has(moduleKey)) {
        observers.get(moduleKey).disconnect();
      }

      const elementId = `aura-container-${moduleKey.replace(/\./g, "-")}`;
      const observer = new MutationObserver((_mutations) => {
        if (!document.getElementById(elementId)) {
          let targetElement = document.querySelector(
            modules[moduleKey].pageSelector
          );
          if (
            targetElement &&
            modules[moduleKey].active &&
            modules[moduleKey].revive
          ) {
            if (!document.getElementById(elementId)) {
              console.log(
                `[HugoAura / UI / Revival] Reviving module ${moduleKey}`
              );
              this.loadModule(moduleKey, true);
            }
          }
        }
      });

      observer.observe(target.parentNode, {
        childList: true,
        subtree: false,
      });

      observers.set(moduleKey, observer);
    };

    const loader = {
      async loadModule(moduleKey, isRevive = false) {
        if (!modules[moduleKey]?.active) return;

        try {
          const config = modules[moduleKey];
          const target = await waitForElement(config.pageSelector);
          const elementId = `aura-container-${moduleKey.replace(/\./g, "-")}`;

          if (document.getElementById(elementId)) {
            console.log(
              `[HugoAura / UI / Warning] Module ${moduleKey} already loaded, skipping`
            );
            return;
          }

          const container = document.createElement("div");
          container.id = elementId;
          containers.set(moduleKey, container);

          const resources = new Set();
          moduleResources.set(moduleKey, resources);

          if (config.pageCSS && !isRevive) {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = `../../aura/${config.pageCSS}`;
            document.head.appendChild(link);
            resources.add(link);
          }

          const html = await fetch(`../../aura/${config.pageURI}`).then((r) =>
            r.text()
          );
          container.innerHTML = html;

          insertElement(target, container, config.selectorMode);
          monitorParent(moduleKey, target, container, config.selectorMode);

          if (config.pageScript && !isRevive) {
            const script = document.createElement("script");
            script.src = `../../aura/${config.pageScript}`;
            document.body.appendChild(script);
            resources.add(script);
          }

          const observer = new MutationObserver(() => {
            if (
              !document.contains(container) &&
              modules[moduleKey].active &&
              modules[moduleKey].revive
            ) {
              this.loadModule(moduleKey, true);
            }
          });

          observer.observe(document.body, {
            childList: true,
            subtree: true,
          });

          observers.set(moduleKey, observer);
        } catch (err) {
          console.error(
            `[HugoAura / UI / Error] Failed to load module ${moduleKey}:`,
            err
          );
        }
      },

      unloadModule(moduleKey) {
        const container = containers.get(moduleKey);
        const observer = observers.get(moduleKey);
        const resources = moduleResources.get(moduleKey);

        if (observer) {
          observer.disconnect();
          observers.delete(moduleKey);
        }

        if (container) {
          container.remove();
          containers.delete(moduleKey);
        }

        if (resources) {
          resources.forEach((element) => element.remove());
          moduleResources.delete(moduleKey);
        }
      },

      handleModuleChange(moduleKey, path = []) {
        const fullPath = [...path, moduleKey].join(".");
        if (path.length === 0 && modules[moduleKey].active) {
          this.loadModule(moduleKey);
        } else if (path.length === 0) {
          this.unloadModule(moduleKey);
        } else {
          if (moduleKey === "active") {
            if (modules[path[0]].active) {
              this.loadModule(path[0]);
            } else {
              this.unloadModule(path[0]);
            }
          } else {
            this.unloadModule(path[0]);
            this.loadModule(path[0]);
          }
        }
      },
    };

    const createDeepProxy = (target, handler, path = []) => {
      return new Proxy(target, {
        get(target, prop) {
          const value = Reflect.get(target, prop);
          if (typeof value === "object" && value !== null) {
            return createDeepProxy(value, handler, [...path, prop]);
          }
          return value;
        },
        set(target, prop, value) {
          console.debug(
            `[HugoAura / UI / Debug] Setting property: ${[...path, prop].join(
              "."
            )}`
          );
          const result = Reflect.set(target, prop, value);
          if (result) {
            handler([...path], prop, value);
          }
          return result;
        },
        deleteProperty(target, prop) {
          console.debug(
            `[HugoAura / UI / Debug] Deleting property: ${[...path, prop].join(
              "."
            )}`
          );
          const result = Reflect.deleteProperty(target, prop);
          if (result) {
            handler([...path], prop, undefined);
          }
          return result;
        },
      });
    };

    const initialLoad = async () => {
      try {
        await loadGlobalJS();

        for (const [key, config] of Object.entries(modules)) {
          if (config.active) {
            await loader.loadModule(key);
          }
        }
      } catch (err) {
        console.error("[HugoAura / UI / Error] Initial load failed:", err);
      }
    };

    initialLoad();

    return createDeepProxy(modules, (path, prop, value) => {
      loader.handleModuleChange(prop, path);
    });
  };

  window.__HUGO_AURA_LOADER__ = createUILoader();

  const loadGlobalStyles = async () => {
    const styles = "__TEMPLATE_GLOBAL_STYLES__";
    styles.forEach((style) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `../../aura/${style}`;
      document.head.appendChild(link);
    });
  };

  const init = async () => {
    await loadGlobalStyles();
    __TEMPLATE_ON_LOADED__;
  };

  init().catch((err) =>
    console.error("[HugoAura / UI / Error] Initialization failed:", err)
  );
})();

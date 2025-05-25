const path = require('path');

class WebpackHook {
  #ruleCache = new Map();

  loadRewriteRules(config) {
    const rewriteConfig = config.rewrite || {};
    const rules = [];

    Object.entries(rewriteConfig).forEach(([rulePath, ruleConfig]) => {
      if (this.#ruleCache.has(rulePath) && !ruleConfig.enabled) {
        console.log(`[HugoAura / AppHook] Skipping disabled rule: ${rulePath}`);
        return;
      }

      try {
        let rule = this.#ruleCache.get(rulePath);

        if (!rule) {
          rule = require(path.join(
            __dirname,
            '../../../aura/jsRewrite/',
            rulePath
          ));
          this.#ruleCache.set(rulePath, rule);
        }

        if (ruleConfig.enabled) {
          rules.push({
            id: rulePath,
            feature: rule.feature,
            method: rule.method,
            methodArg: rule.methodArg,
            preHook: rule.preHook || null,
            newFunction: rule.newFunction,
          });
          console.log(`[HugoAura / AppHook] Loaded rule: ${rulePath}`);
        }
      } catch (err) {
        console.error(
          `[HugoAura / AppHook] Failed to load rule ${rulePath}:`,
          err
        );
      }
    });

    return rules;
  }

  patchModules(modules, rewrites) {
    modules.forEach((mod, index) => {
      if (typeof mod !== 'function') return;
      const stringifyFunc = mod.toString();

      rewrites.forEach((rewrite) => {
        const ruleId = rewrite.id;
        const method = rewrite.method;

        try {
          if (eval(`(stringifyFunc) => ${rewrite.feature}`)(stringifyFunc)) {
            console.log(
              `[HugoAura / AppHook] Found target function for rule ${ruleId} at index ${index}, engaging hook...`
            );

            console.log(`[HugoAura / AppHook] Using hook method: ${method}`);

            let rewrittenFunction = mod;

            switch (method) {
              case 'reactComponent':
                window.__HUGO_AURA_HOOK__[ruleId] = {
                  feature: rewrite.feature,
                  newFunction: rewrite.newFunction
                }
                rewrittenFunction = rewrite.preHook(mod);
                break;
              case 'legacy':
              default:
                rewrittenFunction = rewrite.newFunction;
                break;
            }

            modules[index] = rewrittenFunction;

            console.log(
              `[HugoAura / AppHook] Successfully patched function for rule ${ruleId}`
            );
          }
        } catch (err) {
          console.error(
            `[HugoAura / AppHook] Error evaluating feature for rule ${ruleId}:`,
            err
          );
        }
      });
    });

    if (typeof window !== 'undefined') {
      window.__HUGO_AURA_DEBUG__ = {
        getRuleCache: () => Array.from(this.#ruleCache.keys()),
      };
    }
  }

  installHook(window, config) {
    let realWebpackJsonp = window.webpackJsonp;

    Object.defineProperty(window, 'webpackJsonp', {
      get: () => realWebpackJsonp,
      set: (value) => {
        console.log(
          `[HugoAura / AppHook] Intercepted webpackJsonp initialization`
        );

        if (!realWebpackJsonp && Array.isArray(value)) {
          const originalPush = value.push.bind(value);

          value.push = (...args) => {
            if (args[0] && Array.isArray(args[0][1])) {
              const [chunkIds, modules] = args[0];
              console.log(
                `[HugoAura / AppHook] Intercepting chunk ${chunkIds.join(', ')}`
              );

              const rewrites = this.loadRewriteRules(config);
              if (rewrites.length > 0) {
                this.patchModules(modules, rewrites);
              }
            }
            return originalPush.apply(value, args);
          };
        }

        realWebpackJsonp = value;
      },
      configurable: true,
    });
  }
}

module.exports = WebpackHook;

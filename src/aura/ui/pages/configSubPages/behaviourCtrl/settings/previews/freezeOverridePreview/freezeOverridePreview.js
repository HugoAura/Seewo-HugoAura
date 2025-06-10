// @ts-check

(() => {
  const REQUIRE_BASE = "../..";
  const { genRandomHex } = require(`${REQUIRE_BASE}/aura/utils/crypto`);

  const composables = {
    getAndUpdateDiskInfo: async (curConfig) => {
      const progressingEl = document.getElementsByClassName(
        "acs-bc-dsc-fop-please-wait"
      )[0];
      const onErrorEl = document.getElementsByClassName(
        "acs-bc-dsc-fop-on-req-error"
      )[0];
      const onNotBindEl = document.getElementsByClassName(
        "acs-bc-dsc-fop-on-not-bind"
      )[0];
      const mainEl = document.getElementsByClassName("acs-bc-dsc-fop-main")[0];
      const diskContainerEl =
        document.getElementsByClassName("disks-container")[0];

      const seewoProxyPort = window._ACCEPT_DATA.data.ports.SeewoProxyHTTP;

      const reqPromise = new Promise((resolve) => {
        fetch(
          `https://127.0.0.1:${seewoProxyPort}/forward/freeze/api/v1/get_disk_data`,
          {
            headers: {
              accept: "application/json, text/plain, */*",
              "X-Auth-Traceid": genRandomHex(),
            },
          }
        )
          .then(async (response) => {
            const parsedData = await response.json();

            resolve({
              success: true,
              data: parsedData,
              status: response.status,
            });
          })
          .catch((e) => {
            resolve({ success: false, data: null, errorObj: e });
          });
      });

      const responseInfo = await reqPromise;

      progressingEl.setAttribute("auraIf", "false");

      if (!responseInfo.success) {
        onNotBindEl.setAttribute("auraIf", "false");
        mainEl.setAttribute("auraIf", "false");
        onErrorEl.setAttribute("auraIf", "true");
        const detailEl = document.getElementById("acsBcDscFopOnReqErrorDetail");
        // @ts-expect-error
        detailEl.textContent = responseInfo.errorObj;

        return;
      }

      if (responseInfo.status !== 200) {
        onErrorEl.setAttribute("auraIf", "false");
        mainEl.setAttribute("auraIf", "false");
        onNotBindEl.setAttribute("auraIf", "true");
        return;
      }

      diskContainerEl.innerHTML = ``;

      const curDisks = [];
      for (const disk of responseInfo.data.data[0].disksData) {
        curDisks.push({ name: disk.diskName, status: disk.protectedStatus });
      }

      const diskElTemplate = document.createElement("p");
      diskElTemplate.classList.add("acs-bc-dsc-fop-disk-el");
      if (!curConfig.enable) {
        for (const disk of curDisks) {
          const curDiskEl = diskElTemplate.cloneNode();
          if (disk.status !== 0) {
            // @ts-expect-error
            curDiskEl.classList.add("active");
          }
          curDiskEl.textContent = `${disk.name.toUpperCase()} 盘`;
          diskContainerEl.appendChild(curDiskEl);
        }
      } else {
        switch (curConfig.rewriteMode) {
          case "allFreeze":
            {
              for (const disk of curDisks) {
                const curDiskEl = diskElTemplate.cloneNode();
                // @ts-expect-error
                curDiskEl.classList.add("active");
                curDiskEl.textContent = `${disk.name.toUpperCase()} 盘`;
                diskContainerEl.appendChild(curDiskEl);
              }
            }
            break;
          case "systemOnly":
            {
              let idx = 0;
              for (const disk of curDisks) {
                const curDiskEl = diskElTemplate.cloneNode();
                // @ts-expect-error
                if (idx === 0) curDiskEl.classList.add("active");
                curDiskEl.textContent = `${disk.name.toUpperCase()} 盘`;
                diskContainerEl.appendChild(curDiskEl);
                idx += 1;
              }
            }
            break;
          case "exceptSecondDisk":
            {
              let idx = 0;
              for (const disk of curDisks) {
                const curDiskEl = diskElTemplate.cloneNode();
                // @ts-expect-error
                if (idx === 0) curDiskEl.classList.add("active");
                curDiskEl.textContent = `${disk.name.toUpperCase()} 盘`;
                diskContainerEl.appendChild(curDiskEl);
                idx += 1;
              }
            }
            break;
        }
      }

      onErrorEl.setAttribute("auraIf", "false");
      onNotBindEl.setAttribute("auraIf", "false");
      mainEl.setAttribute("auraIf", "true");
    },
  };

  const onMounted = () => {
    const rootEl = document.getElementsByClassName(
      "acs-bc-dsc-fop-container"
    )[0];

    const eventListener = (_event) => {
      if (!global.__HUGO_AURA__.plsRules) return;
      composables.getAndUpdateDiskInfo(
        global.__HUGO_AURA__.plsRules.client.security.uploadFreezeInfo
      );
    };
    rootEl.addEventListener("onAssociateValueUpdated", eventListener);

    setTimeout(() => {
      eventListener();
    }, 100);
  };

  onMounted();
})();

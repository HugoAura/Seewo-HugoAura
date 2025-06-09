const showReloadToast = () => {
  const prevToast = document.getElementById("relaunchNotifyToast");
  const prevToastBs = bootstrap.Toast.getOrCreateInstance(prevToast);
  if (prevToastBs.isShown()) return;

  const toast = document.getElementById("reloadNotifyToast");
  const toastBs = bootstrap.Toast.getOrCreateInstance(toast);
  if (!toastBs.isShown()) toastBs.show();
};

const showRelaunchToast = () => {
  const prevToast = document.getElementById("reloadNotifyToast");
  const prevToastBs = bootstrap.Toast.getOrCreateInstance(prevToast);
  if (prevToastBs.isShown()) prevToastBs.hide();

  const toast = document.getElementById("relaunchNotifyToast");
  const toastBs = bootstrap.Toast.getOrCreateInstance(toast);
  if (!toastBs.isShown()) toastBs.show();
};

const showRelaunchPLSToast = () => {
  const toast = document.getElementById("relaunchPlsNotifyToast");
  const toastBs = bootstrap.Toast.getOrCreateInstance(toast);

  if (global.__HUGO_AURA__.plsStats.detached) {
    const relaunchBtn = document.getElementById("plsRelaunchBtn");
    relaunchBtn.disabled = true;
    relaunchBtn.textContent = "分离模式下无法执行";
  }

  if (!toastBs.isShown()) toastBs.show();
};

const showToast = (entry) => {
  if (entry.reload) {
    showReloadToast();
  } else if (entry.restart) {
    showRelaunchToast();
  } else if (entry.restartPLS) {
    showRelaunchPLSToast();
  }
};

const insertOrRemoveEl = (parent, child, isInsert = true) => {
  if (Array.isArray(child)) {
    for (const perEl of child) {
      isInsert ? parent.appendChild(perEl) : parent.removeChild(perEl);
    }
  } else {
    isInsert ? parent.appendChild(child) : parent.removeChild(child);
  }
};

const createOnLeaveEvtListener =
  global.__HUGO_AURA_GLOBAL__.utils.createOnLeaveEvtListener;

const renderInputArea = (entry, operationArea, descriptionArea) => {
  switch (entry.type) {
    case "switch": {
      const switchEl = document.createElement("input");
      switchEl.classList.add("form-check-input");
      switchEl.type = "checkbox";
      switchEl.role = "switch";
      switchEl.id = entry.id;
      const elValue = entry.valueGetter();
      switchEl.value = elValue;
      switchEl.checked = elValue;
      switchEl.addEventListener("change", async (event) => {
        showToast(entry);
        await entry.callbackFn(event.target.checked);
      });
      operationArea.classList.add("form-check", "form-switch");
      return switchEl;
    }
    case "radio": {
      const elValue = entry.valueGetter();
      const elArr = [];
      for (const template of entry.templates) {
        const inlineContainerEl = document.createElement("div");
        inlineContainerEl.classList.add("form-check", "form-check-inline");
        const radioEl = document.createElement("input");
        radioEl.value = template;
        radioEl.classList.add("form-check-input");
        radioEl.type = "radio";
        radioEl.name = `${entry.id}Radios`;
        radioEl.id = `${entry.id}Radio${entry.templates.indexOf(template)}`;
        radioEl.checked = template === elValue ? true : false;
        radioEl.addEventListener("change", async (event) => {
          if (event.target.checked) {
            showToast(entry);
            await entry.callbackFn(event.target.value);
          }
        });
        inlineContainerEl.appendChild(radioEl);
        const labelEl = document.createElement("label");
        labelEl.classList.add("form-check-label");
        labelEl.setAttribute("for", radioEl.id);
        labelEl.textContent =
          entry.templateLabels[entry.templates.indexOf(template)];
        inlineContainerEl.appendChild(labelEl);
        elArr.push(inlineContainerEl);
      }
      return elArr;
    }
    case "input": {
      const inputEl = document.createElement("input");
      inputEl.classList.add("form-control");
      inputEl.type = entry.subType;
      inputEl.value = entry.valueGetter();
      inputEl.placeholder = entry.placeHolder;
      inputEl.id = entry.id;
      inputEl.addEventListener("change", async (event) => {
        const result = await entry.callbackFn(event.target.value);
        const success = result.valid;
        if (success) {
          showToast(entry);

          if (inputEl.className.includes("is-invalid")) {
            inputEl.classList.remove("is-invalid");
            descriptionArea.textContent = entry.description;
            descriptionArea.classList.remove("ase-desc-error-hint");
          }
        } else {
          inputEl.classList.add("is-invalid");
          descriptionArea.textContent = result.hint;
          descriptionArea.classList.add("ase-desc-error-hint");
        }
      });
      operationArea.classList.add("ase-operation-area-expanded");
      return inputEl;
    }
    default:
      break;
  }
};

const renderNormalSettingsItem = (entry, formEl) => {
  const entryContainerEl = document.createElement("div");
  entryContainerEl.classList.add("aura-settings-entry");
  entryContainerEl.id = `${entry.id}Container`;

  const entryInfoContainerEl = document.createElement("div");
  entryInfoContainerEl.classList.add("aura-settings-entry-info-container");
  const entryTitle = document.createElement("p");
  entryTitle.classList.add("aura-settings-entry-title");
  entryTitle.textContent = entry.name;
  if (entry.restart) {
    const powerIcon = document.createElement("i");
    powerIcon.classList.add(
      "layui-icon",
      "layui-icon-logout",
      "aura-settings-entry-property-icon"
    );
    powerIcon.setAttribute("data-bs-toggle", "tooltip");
    powerIcon.setAttribute("data-bs-placement", "top");
    powerIcon.setAttribute("data-bs-title", "需要重启 Electron 进程");
    entryTitle.appendChild(powerIcon);
  }
  if (entry.PLSRequired) {
    const plsIcon = document.createElement("i");
    plsIcon.classList.add(
      "layui-icon",
      "layui-icon-component",
      "aura-settings-entry-property-icon"
    );
    plsIcon.setAttribute("data-bs-toggle", "tooltip");
    plsIcon.setAttribute("data-bs-placement", "top");
    plsIcon.setAttribute("data-bs-title", "需要 PLS 支持");
    entryTitle.appendChild(plsIcon);
  }
  if (entry.restartPLS) {
    const plsIcon = document.createElement("i");
    plsIcon.classList.add(
      "layui-icon",
      "layui-icon-logout",
      "aura-settings-entry-property-icon"
    );
    plsIcon.setAttribute("data-bs-toggle", "tooltip");
    plsIcon.setAttribute("data-bs-placement", "top");
    plsIcon.setAttribute("data-bs-title", "需要重启 PLS 进程");
    entryTitle.appendChild(plsIcon);
  }
  if (entry.reload) {
    const reloadIcon = document.createElement("i");
    reloadIcon.classList.add(
      "layui-icon",
      "layui-icon-refresh",
      "aura-settings-entry-property-icon"
    );
    reloadIcon.setAttribute("data-bs-toggle", "tooltip");
    reloadIcon.setAttribute("data-bs-placement", "top");
    reloadIcon.setAttribute("data-bs-title", "需要重载页面");
    entryTitle.appendChild(reloadIcon);
  }

  const createToolTipIcon = (type, content) => {
    const tipIcon = document.createElement("i");
    tipIcon.classList.add(
      "layui-icon",
      "layui-icon-tips",
      "aura-settings-entry-property-icon"
    );
    if (type === "warning") {
      tipIcon.classList.add("aura-settings-entry-warning-icon");
    }
    tipIcon.setAttribute("data-bs-toggle", "tooltip");
    tipIcon.setAttribute("data-bs-placement", "top");
    tipIcon.setAttribute("data-bs-title", content);
    entryTitle.appendChild(tipIcon);
  };

  if (entry.tip) {
    createToolTipIcon("tip", entry.tipTitle);
  }

  if (entry.warning) {
    createToolTipIcon("warning", entry.warningContent);
  }

  const entryDescription = document.createElement("p");
  entryDescription.classList.add("aura-settings-entry-desc");
  entryDescription.innerHTML = entry.description;
  entryInfoContainerEl.appendChild(entryTitle);
  entryInfoContainerEl.appendChild(entryDescription);

  entryContainerEl.appendChild(entryInfoContainerEl);

  const entryOperationArea = document.createElement("div");
  entryOperationArea.classList.add("aura-settings-entry-operation-area");

  let targetEl = renderInputArea(entry, entryOperationArea, entryDescription);
  insertOrRemoveEl(entryOperationArea, targetEl, true);

  if (entry.reactive) {
    const evtListener = (event) => {
      if (entry.reactiveVal.includes(event.detail.path.join("."))) {
        insertOrRemoveEl(entryOperationArea, targetEl, false);
        targetEl = renderInputArea(entry, entryOperationArea, entryDescription);
        insertOrRemoveEl(entryOperationArea, targetEl, true);
      }
    };
    const channel = entry.PLSRequired
      ? "onPLSConfigUpdate"
      : "onHugoAuraConfigUpdate";
    entryContainerEl.addEventListener(channel, evtListener);
    // createOnLeaveEvtListener(channel, evtListener);
  }

  const setDisableStatus = (el, isDisable, hint = null) => {
    if (isDisable) {
      el.classList.add("ase-operation-area-disabled");
      if (hint) {
        el.setAttribute("data-bs-toggle", "tooltip");
        el.setAttribute("data-bs-placement", "top");
        el.setAttribute("data-bs-title", hint);
      }
    } else {
      el.setAttribute("data-bs-toggle", "");
      el.setAttribute("data-bs-placement", "");
      el.setAttribute("data-bs-title", "");
      el.classList.remove("ase-operation-area-disabled");
    }
  };

  if (entry.PLSRequired) {
    if (!global.__HUGO_AURA__.plsStats.connected) {
      setDisableStatus(entryOperationArea, true, "连接至 PLS 以继续");
    }

    const evtListener = (event) => {
      if (event.detail.connected) {
        setDisableStatus(entryOperationArea, false);
      } else {
        setDisableStatus(entryOperationArea, true, "连接至 PLS 以继续");
      }
    };
    entryContainerEl.addEventListener("onPLSStatsUpdate", evtListener);
    // createOnLeaveEvtListener("onPLSStatsUpdate", evtListener);
  }
  entryContainerEl.appendChild(entryOperationArea);
  const isShow = entry.auraIf();
  if (!isShow) entryContainerEl.classList.add("aura-settings-entry-hidden");

  if (entry.associateVal) {
    const evtListener = (event) => {
      if (!entry.associateVal.includes(event.detail.path.join("."))) return;
      const cls = entryContainerEl.classList;
      const isShow = entry.auraIf();
      isShow
        ? cls.remove("aura-settings-entry-hidden")
        : cls.add("aura-settings-entry-hidden");
    };
    const channel = entry.PLSRequired
      ? "onPLSConfigUpdate"
      : "onHugoAuraConfigUpdate";
    entryContainerEl.addEventListener(channel, evtListener);
    // createOnLeaveEvtListener(channel, evtListener);
  }

  formEl.appendChild(entryContainerEl);
};

const renderPreviewItem = (entry, formEl) => {
  const elementId = entry.customId ? entry.customId : `${entry.id}Container`;
  const eventChannel = entry.listenerType;

  const separateHrContainer = document.createElement("div");
  separateHrContainer.classList.add("aura-settings-preview-area-hr-container");

  const hrTitle = document.createElement("p");
  hrTitle.textContent = "预览";

  const hrElement = document.createElement("hr");
  hrElement.classList.add("aura-settings-preview-hr");

  separateHrContainer.appendChild(hrElement);
  separateHrContainer.appendChild(hrTitle);
  separateHrContainer.appendChild(hrElement.cloneNode());

  formEl.appendChild(separateHrContainer);

  const previewContainerEl = document.createElement("div");
  previewContainerEl.classList.add("aura-settings-preview-area-container");
  previewContainerEl.id = elementId;

  const eventListener = (event) => {
    const childs = previewContainerEl.querySelectorAll("*");
    Array.from(childs).forEach((el) => {
      el.dispatchEvent(
        new CustomEvent("onAssociateValueUpdated", { detail: event.detail })
      );
    });
  };

  document.addEventListener(
    eventChannel === "pls" ? "onPLSConfigUpdate" : "onHugoAuraConfigUpdate",
    eventListener
  );
  createOnLeaveEvtListener(eventListener); // Clean up

  formEl.appendChild(previewContainerEl);

  setTimeout(() => {
    global.__HUGO_AURA_LOADER__[entry.loaderTarget].active = true;
  }, 50);
};

const renderChild = (entry, formEl) => {
  switch (entry.type) {
    case "preview":
      renderPreviewItem(entry, formEl);
      break;
    default:
      renderNormalSettingsItem(entry, formEl);
      break;
  }
};

const settingsRenderer = (pendingEl, settingsObj) => {
  const formEl = document.createElement("form");
  formEl.classList.add("aura-settings-form");
  for (const category of settingsObj) {
    const categoryTitleEl = document.createElement("p");
    categoryTitleEl.classList.add("aura-settings-category-header");
    categoryTitleEl.textContent = category.categoryName;
    formEl.appendChild(categoryTitleEl);
    for (const entry of category.child) {
      renderChild(entry, formEl);
    }

    const hrEl = document.createElement("hr");
    hrEl.classList.add("aura-settings-hr-horizontal");
    formEl.appendChild(hrEl);
  }
  pendingEl.appendChild(formEl);

  global.__HUGO_AURA_GLOBAL__.utils.refreshBsTooltip();
};

module.exports = { settingsRenderer };

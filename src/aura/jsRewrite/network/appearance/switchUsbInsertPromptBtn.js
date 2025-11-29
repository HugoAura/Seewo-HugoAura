/// Rewrite rules basic config section begins ///

const type = "localResource";

const urlPattern = "usbInsertPrompt.js";

/// End of the rewrite rules basic config section ///

let ruleFn = (originalContent, ruleConfig) => {
  if (ruleConfig.mode === "switch") {
    originalContent = originalContent.replace(/查杀可预防设备感染，守护设备安全/g, "检测到新的设备插入");
    originalContent = originalContent.replace(/开始查杀（推荐）/g, "打开 U 盘");
    originalContent = originalContent.replace(
      /onClick:this.handleStartVirusKilling/g,
      "onClick:this.handleOpen"
    );
    originalContent = originalContent.replace(
      /,D.a.createElement\("p",null,"打开U盘"\)/g,
      ""
    );
  } else if (ruleConfig.mode === "hide") {
    originalContent = originalContent.replace(/15e3/g, "0");
  }
  return originalContent;
};

module.exports = {
  type,
  urlPattern,
  ruleFn,
};

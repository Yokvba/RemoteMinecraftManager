const loginView = document.getElementById("loginView"),
  appView = document.getElementById("appView"),
  loginForm = document.getElementById("loginForm"),
  loginError = document.getElementById("loginError"),
  logoutBtn = document.getElementById("logoutBtn"),
  menuToggle = document.getElementById("menuToggle"),
  menu = document.getElementById("menu"),
  minecraftPageBtn = document.getElementById("minecraftPageBtn"),
  serverPageBtn = document.getElementById("serverPageBtn"),
  fileManagerPageBtn = document.getElementById("fileManagerPageBtn"),
  minecraftPage = document.getElementById("minecraftPage"),
  serverPage = document.getElementById("serverPage"),
  fileManagerPage = document.getElementById("fileManagerPage");

const statusText = document.getElementById("statusText"),
  statusDot = document.getElementById("statusDot"),
  serverStatusValue = document.getElementById("serverStatusValue"),
  serverPingValue = document.getElementById("serverPingValue"),
  serverCpuValue = document.getElementById("serverCpuValue"),
  serverRamValue = document.getElementById("serverRamValue"),
  serverDiskPercent = document.getElementById("serverDiskPercent"),
  serverDiskBar = document.getElementById("serverDiskBar"),
  serverDiskInfo = document.getElementById("serverDiskInfo"),
  serverUptimeValue = document.getElementById("serverUptimeValue"),
  serverNetworkDownValue = document.getElementById("serverNetworkDownValue"),
  serverNetworkUpValue = document.getElementById("serverNetworkUpValue"),
  serverNetworkDownBar = document.getElementById("serverNetworkDownBar"),
  serverNetworkUpBar = document.getElementById("serverNetworkUpBar");

const outputEl = document.getElementById("output"),
  serverOutputEl = document.getElementById("serverOutput"),
  serverCommandForm = document.getElementById("serverCommandForm"),
  serverCommandInput = document.getElementById("serverCommandInput"),
  startBtn = document.getElementById("startBtn"),
  stopBtn = document.getElementById("stopBtn"),
  logsBtn = document.getElementById("logsBtn"),
  consoleForm = document.getElementById("consoleForm"),
  consoleInput = document.getElementById("consoleInput"),
  usernameInput = document.getElementById("usernameInput"),
  passwordInput = document.getElementById("passwordInput");

const settingsBtn = document.getElementById("settingsBtn"),
  settingsModal = document.getElementById("settingsModal"),
  closeSettingsBtn = document.getElementById("closeSettingsBtn"),
  cancelSettingsBtn = document.getElementById("cancelSettingsBtn"),
  settingsForm = document.getElementById("settingsForm"),
  fileEditorModal = document.getElementById("fileEditorModal"),
  closeFileEditorBtn = document.getElementById("closeFileEditorBtn"),
  cancelFileEditorBtn = document.getElementById("cancelFileEditorBtn"),
  saveFileEditorBtn = document.getElementById("saveFileEditorBtn"),
  fileEditorTitle = document.getElementById("fileEditorTitle"),
  fileEditorInput = document.getElementById("fileEditorInput"),
  fileEditorError = document.getElementById("fileEditorError"),
  refreshFilesBtn = document.getElementById("refreshFilesBtn"),  
  uploadFileBtn = document.getElementById("uploadFileBtn"),
  uploadFileInput = document.getElementById("uploadFileInput"),
  uploadModal = document.getElementById("uploadModal"),
  closeUploadBtn = document.getElementById("closeUploadBtn"),
  uploadStatusText = document.getElementById("uploadStatusText"),  
  uploadProgressBar = document.getElementById("uploadProgressBar"),
  termsModal = document.getElementById("termsModal"),
  closeTermsBtn = document.getElementById("closeTermsBtn"),
  acceptTermsBtn = document.getElementById("acceptTermsBtn"),
  parentDirectoryBtn = document.getElementById("parentDirectoryBtn"),
  fileManagerPath = document.getElementById("fileManagerPath"),
  fileManagerError = document.getElementById("fileManagerError"),
  fileList = document.getElementById("fileList");

const DEFAULT_REFRESH_INTERVAL_MS = 1500;
let lastStatusData = null;
let refreshTimer = null;
let currentFilesPath = "";

function setStatus(online) {
  statusText.textContent = online
    ? "Minecraft is online"
    : "Minecraft is offline";
  statusText.style.color = online ? "#86efac" : "#fca5a5";
  statusDot.style.background = online ? "#22c55e" : "#ef4444";
  statusDot.style.boxShadow = online
    ? "0 0 10px rgba(34, 197, 94, 0.8)"
    : "0 0 10px rgba(239, 68, 68, 0.8)";
}

function setOutput(value) {
  const wasAtBottom =
    outputEl.scrollHeight - outputEl.scrollTop - outputEl.clientHeight < 24;
  outputEl.textContent = value || "No output returned.";

  if (wasAtBottom) {
    requestAnimationFrame(() => {
      outputEl.scrollTop = outputEl.scrollHeight;
    });
  }
}

function setServerOutput(value) {
  serverOutputEl.textContent = value || "No output returned.";
}

function showPage(pageName) {
  const pageMap = {
    minecraft: minecraftPage,
    server: serverPage,
    files: fileManagerPage,
  };
  Object.entries(pageMap).forEach(([name, page]) =>
    page.classList.toggle("hidden", name !== pageName),
  );
  menu.classList.remove("open");

  if (pageName === "minecraft") {
    requestAnimationFrame(() => {
      outputEl.scrollTop = outputEl.scrollHeight;
    });
  }

  if (pageName === "files") loadFiles();
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

function renderFiles(entries) {
  fileList.replaceChildren();

  if (!entries.length) {
    fileList.innerHTML = '<div class="file-list-empty">No files found.</div>';
    return;
  }

  entries.forEach((entry) => {
    const row = document.createElement("div");
    row.className = `file-row ${entry.type === "directory" ? "file-row-directory" : ""}`;
    const openButton = document.createElement("button");
    openButton.className = "file-name file-open-btn";
    openButton.type = "button";
    openButton.textContent = `${entry.type === "directory" ? "📁" : "📄"} ${entry.name}`;

    const type = document.createElement("span");
    type.className = "file-type";
    type.textContent =
      entry.type === "directory" ? "Directory" : formatFileSize(entry.size);

    const date = document.createElement("span");
    date.className = "file-date";
    date.textContent = new Date(entry.modifiedAt).toLocaleString();

    const actions = document.createElement("span");
    actions.className = "file-actions";
    actions.innerHTML =
    '<button class="file-action-btn file-info-btn" type="button">ℹ️</button><button class="file-action-btn file-rename-btn" type="button">✏️</button><button class="file-action-btn file-delete-btn" type="button">🗑️</button>';
    row.append(openButton, type, date, actions);
    openButton.addEventListener("click", () => {
      if (entry.type === "directory")
        loadFiles(`${currentFilesPath}/${entry.name}`);
      else openFileEditor(entry);
    });    
    row
      .querySelector(".file-info-btn")
      .addEventListener("click", () => showFileInfo(entry));
    row
      .querySelector(".file-rename-btn")
      .addEventListener("click", () => renameFile(entry));
    row
      .querySelector(".file-delete-btn")
      .addEventListener("click", () => deleteFile(entry));
    fileList.appendChild(row);
  });
}

function showFileInfo(entry) {
  const filePath = `/${currentFilesPath}/${entry.name}${entry.type === "directory" ? "/" : ""}`.replace(/\/+/g, "/");
  const type = entry.type === "directory" ? "Directory" : "File";
  const size = entry.type === "directory" ? "—" : formatFileSize(entry.size);
  const created = entry.createdAt
    ? new Date(entry.createdAt).toLocaleString()
    : "Unknown";
  const modified = new Date(entry.modifiedAt).toLocaleString();

  alert(
    `Name: ${entry.name}\nType: ${type}\nSize: ${size}\nCreated: ${created}\nModified: ${modified}\nPath: ${filePath}`,
  );
}

async function openFileEditor(entry) {
  const relativePath = `${currentFilesPath}/${entry.name}`.replace(/^\/+/, "");
  fileEditorTitle.textContent = `Edit ${entry.name}`;
  fileEditorError.classList.add("hidden");
  fileEditorInput.value = "Loading...";
  fileEditorInput.disabled = true;
  saveFileEditorBtn.disabled = true;
  fileEditorModal.classList.remove("hidden");

  try {
    const data = await fetchJson(
      `/api/files/content?path=${encodeURIComponent(relativePath)}`,
    );
    fileEditorInput.value = data.content;
    fileEditorInput.disabled = false;
    saveFileEditorBtn.disabled = false;
    fileEditorInput.focus();
  } catch (error) {
    fileEditorInput.value = "";
    fileEditorError.textContent = error.message;
    fileEditorError.classList.remove("hidden");
  }

  saveFileEditorBtn.dataset.path = relativePath;
}

function closeFileEditor() {
  fileEditorModal.classList.add("hidden");
  fileEditorInput.value = "";
  fileEditorInput.disabled = true;
  saveFileEditorBtn.disabled = true;
}

async function saveFileEditor() {
  const relativePath = saveFileEditorBtn.dataset.path;
  if (!relativePath) return;

  saveFileEditorBtn.disabled = true;
  try {
    await fetchJson("/api/files/content", {
      method: "POST",
      body: JSON.stringify({
        path: relativePath,
        content: fileEditorInput.value,
      }),
    });
    alert("File saved successfully.");
    closeFileEditor();
    await loadFiles();
  } catch (error) {
    fileEditorError.textContent = error.message;
    fileEditorError.classList.remove("hidden");
    saveFileEditorBtn.disabled = false;
  }
}

async function loadFiles(relativePath = currentFilesPath) {
  fileManagerError.classList.add("hidden");
  fileList.innerHTML = '<div class="file-list-empty">Loading files...</div>';

  try {
    const normalizedPath = relativePath
      .replace(/\\/g, "/")
      .replace(/^\/+|\/+$/g, "");
    const query = normalizedPath
      ? `?path=${encodeURIComponent(normalizedPath)}`
      : "";
    const data = await fetchJson(`/api/files${query}`);
    currentFilesPath = data.relativePath || "";
    fileManagerPath.textContent = data.path;
    parentDirectoryBtn.disabled = !currentFilesPath;
    renderFiles(data.entries);
  } catch (error) {
    fileManagerPath.textContent = "Configured server path unavailable";
    fileManagerError.textContent = error.message;
    fileManagerError.classList.remove("hidden");
    fileList.replaceChildren();
  }
}

async function renameFile(entry) {
  const newName = prompt(`Rename ${entry.name} to:`, entry.name);
  if (!newName || newName === entry.name) return;

  try {
    await fetchJson("/api/files/rename", {
      method: "POST",
      body: JSON.stringify({
        path: `${currentFilesPath}/${entry.name}`,
        newName,
      }),
    });
    await loadFiles();
  } catch (error) {
    fileManagerError.textContent = error.message;
    fileManagerError.classList.remove("hidden");
  }
}

async function deleteFile(entry) {
  if (
    !confirm(
      `Delete ${entry.type === "directory" ? "folder" : "file"} "${entry.name}"?`,
    )
  )
    return;

  try {
    await fetchJson("/api/files/delete", {
      method: "POST",
      body: JSON.stringify({ path: `${currentFilesPath}/${entry.name}` }),
    });
    await loadFiles();
  } catch (error) {
    fileManagerError.textContent = error.message;
    fileManagerError.classList.remove("hidden");
  }
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(String(reader.result || "").split(",")[1] || "");
    reader.onerror = () => reject(new Error(`Failed to read "${file.name}".`));
    reader.readAsDataURL(file);
  });
}

function uploadFileWithProgress(file, content, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/files/upload");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    });
    xhr.addEventListener("load", () => {
      let data = {};
      try {
        data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        /* ignore parse errors, fall through to status check */
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data);
      else reject(new Error(data.message || "Upload failed."));
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Upload failed due to a network error.")),
    );
    xhr.send(
      JSON.stringify({ path: currentFilesPath, name: file.name, content }),
    );
  });
}

async function uploadFiles(files) {
  if (!files.length) return;
  fileManagerError.classList.add("hidden");
  uploadFileBtn.disabled = true;
  uploadModal.classList.remove("hidden");

  try {
    for (let i = 0; i < files.length; i += 1) {
      const file = files[i];
      uploadProgressBar.style.width = "0%";
      uploadStatusText.textContent = `Uploading ${file.name} (${i + 1}/${files.length}) — 0%`;

      const content = await readFileAsBase64(file);
      await uploadFileWithProgress(file, content, (fraction) => {
        const percent = Math.round(fraction * 100);
        uploadProgressBar.style.width = `${percent}%`;
        uploadStatusText.textContent = `Uploading ${file.name} (${i + 1}/${files.length}) — ${percent}%`;
      });
    }
    uploadStatusText.textContent = `Upload complete: ${files.length} file${files.length > 1 ? "s" : ""} uploaded.`;
    await loadFiles();
  } catch (error) {
    uploadModal.classList.add("hidden");
    fileManagerError.textContent = error.message;
    fileManagerError.classList.remove("hidden");
  } finally {
    uploadFileBtn.disabled = false;
  }
}

function setAuthenticated(user) {
  const isLoggedIn = Boolean(user);
  loginView.classList.toggle("hidden", isLoggedIn);
  appView.classList.toggle("hidden", !isLoggedIn);
  if (isLoggedIn) {
    setOutput(`Logged in as ${user}.\n\nWaiting for live server status...`);
  if (!hasAcceptedTerms()) openTerms();
  } else {
    setOutput("Please log in to manage the server.");
    setStatus(false);
  }
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    ...options,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) throw new Error(data.message || "Request failed.");
  return data;
}

acceptTermsBtn.addEventListener("click", acceptTerms);
closeTermsBtn.addEventListener("click", closeTerms);
termsModal.addEventListener("click", (event) => {
  if (event.target === termsModal) closeTerms();
});

async function checkSession() {
  try {
    const data = await fetchJson("/api/session");
    setAuthenticated(data.user);
    if (data.loggedIn) await refreshLiveData();
  } catch {
    setAuthenticated(null);
  }
}

function renderServerStatusSummary(statusData = {}) {
  const hostStatus = statusData.hostStatus || {};
  const online = Boolean(statusData.online);
  serverStatusValue.textContent =
    hostStatus.status || (online ? "Online" : "Offline");
  serverPingValue.textContent = hostStatus.ping || "N/A";
  serverCpuValue.textContent = hostStatus.cpu || "N/A";
  serverRamValue.textContent = hostStatus.ram || "N/A";
  serverUptimeValue.textContent = hostStatus.uptime || "N/A";
  serverNetworkDownValue.textContent = hostStatus.networkDown || "N/A";
  serverNetworkUpValue.textContent = hostStatus.networkUp || "N/A";

  const networkDown = Number(hostStatus.networkDownMbps) || 0;
  const networkUp = Number(hostStatus.networkUpMbps) || 0;
  const networkMax =
    Number(hostStatus.networkCapacityMbps) ||
    Math.max(networkDown, networkUp, 1);
  serverNetworkDownBar.style.width = `${Math.min(100, (networkDown / networkMax) * 100)}%`;
  serverNetworkUpBar.style.width = `${Math.min(100, (networkUp / networkMax) * 100)}%`;

  const percent = Number(hostStatus.diskPercent ?? 0);
  const safePercent = Number.isFinite(percent)
    ? Math.min(100, Math.max(0, percent))
    : 0;
  serverDiskPercent.textContent = `${safePercent}%`;
  serverDiskBar.style.width = `${safePercent}%`;
  serverDiskBar.style.background =
    safePercent >= 80 ? "#f87171" : safePercent >= 60 ? "#fbbf24" : "#4ade80";
  serverDiskInfo.textContent = `${hostStatus.diskUsed || 0} GB / ${hostStatus.diskTotal || 0} GB`;
}

async function refreshLiveData() {
  try {
    const [statusData, logData] = await Promise.all([
      fetchJson("/api/status"),
      fetchJson("/api/logs"),
    ]);
    lastStatusData = statusData;
    const minecraftOnline = Boolean(statusData.hostStatus?.online);
    setStatus(minecraftOnline);
    renderServerStatusSummary(statusData);
    if (!minecraftPage.classList.contains("hidden"))
      setOutput(logData.output || "No output returned.");
  } catch (error) {
    setStatus(false);
    renderServerStatusSummary({ online: false, hostStatus: {} });
    if (!minecraftPage.classList.contains("hidden"))
      setOutput(`Live update failed.\n${error.message}`);
  }
}

function refreshServerConsole() {
  if (lastStatusData) {
    renderServerStatusSummary(lastStatusData);
  }
}

async function actionRequest(endpoint, label) {
  try {
    const data = await fetchJson(endpoint, { method: "POST" });
    setServerOutput(`${label}\n\n${data.output || "No output returned."}`);
    await refreshLiveData();
  } catch (error) {
    setServerOutput(`${label} failed.\n${error.message}`);
  }
}

function toggleMenu() {
  menu.classList.toggle("open");
}

async function loadSettings() {
  try {
    const response = await fetch("/config.json");
    const config = await response.json();
    document.getElementById("socketHost").value = config.socket?.host || "";
    document.getElementById("socketPort").value = config.socket?.port || "";
    document.getElementById("minecraftScreenName").value =
      config.minecraft?.screenName || "";
    document.getElementById("minecraftServerPath").value =
      config.minecraft?.serverPath || "";
    document.getElementById("minecraftWebUrl").value =
      config.minecraft?.webUrl || "";
    document.getElementById("webHost").value = config.web?.host || "";
    document.getElementById("webPort").value = config.web?.port || "";
    document.getElementById("refreshIntervalMs").value =
      config.web?.refreshIntervalMs || DEFAULT_REFRESH_INTERVAL_MS;
  } catch (error) {
    console.error("Failed to load settings:", error);
    alert("Failed to load settings.");
  }
}

function hasAcceptedTerms() {
  return localStorage.getItem("termsAccepted") === "true";
}
function openTerms() {
  termsModal.classList.remove("hidden");
}
function closeTerms() {
  termsModal.classList.add("hidden");
}
function acceptTerms() {
  localStorage.setItem("termsAccepted", "true");
  closeTerms();
}


function openSettings() {
  loadSettings();
  settingsModal.classList.remove("hidden");
}
function closeSettings() {
  settingsModal.classList.add("hidden");
}

function setRefreshRate(intervalMs) {
  const safeIntervalMs = Math.max(
    100,
    Number(intervalMs) || DEFAULT_REFRESH_INTERVAL_MS,
  );

  if (refreshTimer) {
    clearInterval(refreshTimer);
  }

  refreshTimer = setInterval(() => {
    if (!appView.classList.contains("hidden")) {
      refreshLiveData();

      if (!serverPage.classList.contains("hidden")) {
        refreshServerConsole();
      }
    }
  }, safeIntervalMs);
}

document.addEventListener("click", (event) => {
  if (!menu.contains(event.target) && !menuToggle.contains(event.target))
    menu.classList.remove("open");
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginError.textContent = "";
  try {
    const data = await fetchJson("/api/login", {
      method: "POST",
      body: JSON.stringify({
        username: usernameInput.value.trim(),
        password: passwordInput.value.trim(),
      }),
    });
    setAuthenticated(data.user);
    usernameInput.value = "";
    passwordInput.value = "";
    await refreshLiveData();
  } catch (error) {
    loginError.textContent = error.message;
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await fetchJson("/api/logout", { method: "POST" });
  } catch (error) {
    console.error(error);
  }
  setAuthenticated(null);
});

menuToggle.addEventListener("click", toggleMenu);
minecraftPageBtn.addEventListener("click", () => showPage("minecraft"));
serverPageBtn.addEventListener("click", () => showPage("server"));
fileManagerPageBtn.addEventListener("click", () => showPage("files"));
refreshFilesBtn.addEventListener("click", () => loadFiles());
parentDirectoryBtn.addEventListener("click", () => {
  const parentPath = currentFilesPath.split("/").slice(0, -1).join("/");
  loadFiles(parentPath);
});
uploadFileBtn.addEventListener("click", () => uploadFileInput.click());
uploadFileInput.addEventListener("change", () => {
  const files = Array.from(uploadFileInput.files || []);
  uploadFileInput.value = "";
  uploadFiles(files);
});
closeUploadBtn.addEventListener("click", () =>
  uploadModal.classList.add("hidden"),
);
uploadModal.addEventListener("click", (event) => {
  if (event.target === uploadModal) uploadModal.classList.add("hidden");
});
closeFileEditorBtn.addEventListener("click", closeFileEditor);
cancelFileEditorBtn.addEventListener("click", closeFileEditor);
saveFileEditorBtn.addEventListener("click", saveFileEditor);
fileEditorModal.addEventListener("click", (event) => {
  if (event.target === fileEditorModal) closeFileEditor();
});
settingsBtn.addEventListener("click", openSettings);
closeSettingsBtn.addEventListener("click", closeSettings);
cancelSettingsBtn.addEventListener("click", closeSettings);
settingsModal.addEventListener("click", (event) => {
  if (event.target === settingsModal) closeSettings();
});

settingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const updates = {};
  for (const [key, value] of new FormData(settingsForm).entries()) {
    const keys = key.split(".");
    let obj = updates;
    for (let index = 0; index < keys.length - 1; index++)
      obj = obj[keys[index]] ||= {};
    obj[keys.at(-1)] =
      value !== "" && !Number.isNaN(Number(value)) ? Number(value) : value;
  }
  try {
    const result = await fetchJson("/api/config", {
      method: "POST",
      body: JSON.stringify(updates),
    });
    if (!result.success) throw new Error(result.message || "Unknown error");
    setRefreshRate(updates.web?.refreshIntervalMs);
    alert("Settings saved successfully!");
    closeSettings();
  } catch (error) {
    alert(`Error saving settings: ${error.message}`);
  }
});

startBtn.addEventListener("click", () =>
  actionRequest("/api/start", "Start output"),
);
stopBtn.addEventListener("click", () =>
  actionRequest("/api/stop", "Stop output"),
);
logsBtn.addEventListener("click", async () => {
  try {
    const data = await fetchJson("/api/logs");
    setOutput(`Latest log output\n\n${data.output || "No output returned."}`);
  } catch (error) {
    setOutput(`Failed to load logs.\n${error.message}`);
  }
});

serverCommandInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    serverCommandForm.requestSubmit();
  }
});

serverCommandForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const command = serverCommandInput.value.trim();
  if (!command) {
    setServerOutput("No command entered.");
    return;
  }
  try {
    const data = await fetchJson("/api/run", {
      method: "POST",
      body: JSON.stringify({ command }),
    });
    setServerOutput(
      `Command output\n\n${data.output || "No output returned."}`,
    );
    serverCommandInput.value = "";
  } catch (error) {
    setServerOutput(`Command failed.\n${error.message}`);
  }
});

consoleInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    consoleForm.requestSubmit();
  }
});

consoleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const command = consoleInput.value.trim();
  if (!command) {
    setOutput("Please enter a command to send to the server console.");
    return;
  }
  try {
    const data = await fetchJson("/api/console", {
      method: "POST",
      body: JSON.stringify({ command }),
    });
    setOutput(`Console output\n\n${data.output || "No output returned."}`);
    consoleInput.value = "";
    await refreshLiveData();
  } catch (error) {
    setOutput(`Console command failed.\n${error.message}`);
  }
});

checkSession();
showPage("minecraft");
setRefreshRate(DEFAULT_REFRESH_INTERVAL_MS);

const AdminShared = (() => {
  const GITHUB_OWNER = 'yutaabelclear-design';
  const GITHUB_REPO = 'sum-homepage';
  const GITHUB_BRANCH = 'main';

  function utf8ToBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }

  function base64ToUtf8(b64) {
    return decodeURIComponent(escape(atob(b64.replace(/\s/g, ''))));
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function formatDate(value) {
    const [y, m, d] = value.split('-');
    return { iso: value, label: `${y}.${m}.${d}` };
  }

  function serializeDoc(doc) {
    return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}\n`;
  }

  const PASSWORD_STORAGE_KEY = 'sumAdminPassword';
  const AUTH_FLAG_KEY = 'sumAdminAuthenticated';

  function getStoredPassword(fallbackPassword) {
    return localStorage.getItem(PASSWORD_STORAGE_KEY) || fallbackPassword;
  }

  function setStoredPassword(newPassword) {
    localStorage.setItem(PASSWORD_STORAGE_KEY, newPassword);
  }

  function isAuthenticated() {
    return localStorage.getItem(AUTH_FLAG_KEY) === 'true';
  }

  function setupAuthGate(fallbackPassword) {
    const authGate = document.getElementById('authGate');
    const authForm = document.getElementById('authForm');
    const authError = document.getElementById('authError');
    const adminMain = document.getElementById('adminMain');

    if (isAuthenticated()) {
      authGate.classList.add('is-hidden');
      adminMain.classList.remove('is-hidden');
      return;
    }

    authForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = document.getElementById('authPassword').value;
      if (value === getStoredPassword(fallbackPassword)) {
        localStorage.setItem(AUTH_FLAG_KEY, 'true');
        authGate.classList.add('is-hidden');
        adminMain.classList.remove('is-hidden');
      } else {
        authError.textContent = 'パスワードが違います。';
      }
    });
  }

  function requireAuthOrRedirect() {
    const adminMain = document.getElementById('adminMain');
    const authGate = document.getElementById('authGate');
    if (isAuthenticated()) {
      if (authGate) authGate.classList.add('is-hidden');
      adminMain.classList.remove('is-hidden');
      return true;
    }
    if (authGate) authGate.classList.remove('is-hidden');
    return false;
  }

  function setupTokenPersistence(inputEl, storageKey, statusEl) {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      inputEl.value = saved;
      if (statusEl) statusEl.textContent = 'このブラウザに保存されたトークンを使用します。';
    }
    inputEl.addEventListener('input', () => {
      localStorage.setItem(storageKey, inputEl.value);
    });
  }

  async function githubRequest(tokenInputEl, path, options = {}) {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${tokenInputEl.value.trim()}`,
        Accept: 'application/vnd.github+json',
        ...(options.headers || {}),
      },
    });
    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`GitHub API error (${response.status}): ${errText}`);
    }
    return response.json();
  }

  async function loadFileDoc(tokenInputEl, path) {
    const current = await githubRequest(tokenInputEl, `${path}?ref=${GITHUB_BRANCH}`);
    const text = base64ToUtf8(current.content);
    const doc = new DOMParser().parseFromString(text, 'text/html');
    return { doc, sha: current.sha };
  }

  async function saveFileDoc(tokenInputEl, path, doc, sha, message) {
    await githubRequest(tokenInputEl, path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        content: utf8ToBase64(serializeDoc(doc)),
        sha,
        branch: GITHUB_BRANCH,
      }),
    });
  }

  async function insertSnippetIntoFile(tokenInputEl, path, marker, snippet, message) {
    const current = await githubRequest(tokenInputEl, `${path}?ref=${GITHUB_BRANCH}`);
    const text = base64ToUtf8(current.content);
    const index = text.indexOf(marker);
    if (index === -1) {
      throw new Error(`marker-not-found-in-${path}`);
    }
    const insertAt = index + marker.length;
    const newText = `${text.slice(0, insertAt)}\n          ${snippet}${text.slice(insertAt)}`;
    await githubRequest(tokenInputEl, path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message || `Add content to ${path}`,
        content: utf8ToBase64(newText),
        sha: current.sha,
        branch: GITHUB_BRANCH,
      }),
    });
  }

  function setupCopyButton(buttonEl, outputEl, noteEl, successMessage) {
    buttonEl.addEventListener('click', async () => {
      if (!outputEl.value) return;
      try {
        await navigator.clipboard.writeText(outputEl.value);
        noteEl.textContent = successMessage;
      } catch (err) {
        outputEl.select();
        noteEl.textContent = '自動コピーに失敗しました。手動で選択してコピーしてください。';
      }
    });
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function getFileSha(tokenInputEl, path) {
    try {
      const current = await githubRequest(tokenInputEl, `${path}?ref=${GITHUB_BRANCH}`);
      return current.sha;
    } catch (err) {
      return null;
    }
  }

  async function putBinaryFile(tokenInputEl, path, file, message) {
    const base64 = await fileToBase64(file);
    const sha = await getFileSha(tokenInputEl, path);
    const body = {
      message,
      content: base64,
      branch: GITHUB_BRANCH,
    };
    if (sha) body.sha = sha;
    await githubRequest(tokenInputEl, path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  function loadImageDimensions(dataUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
      img.onerror = () => resolve({ width: 800, height: 600 });
      img.src = dataUrl;
    });
  }

  function buildSvgWrapper(dataUrl, width, height) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><image href="${dataUrl}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice" /></svg>`;
  }

  async function buildUploadBlob(file, targetPath) {
    const isTargetSvg = targetPath.toLowerCase().endsWith('.svg');
    const isFileSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');

    if (!isTargetSvg || isFileSvg) {
      return file;
    }

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const { width, height } = await loadImageDimensions(dataUrl);
    const svgText = buildSvgWrapper(dataUrl, width, height);
    return new File([svgText], file.name, { type: 'image/svg+xml' });
  }

  async function replaceImageAtPath(tokenInputEl, path, file, message) {
    const uploadFile = await buildUploadBlob(file, path);
    await putBinaryFile(tokenInputEl, path, uploadFile, message);
  }

  function renderPostRow(label, onDelete) {
    const row = document.createElement('div');
    row.className = 'admin-post-row';

    const labelEl = document.createElement('span');
    labelEl.textContent = label;

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.textContent = '削除';
    delBtn.className = 'admin-delete-btn';
    delBtn.addEventListener('click', onDelete);

    row.appendChild(labelEl);
    row.appendChild(delBtn);
    return row;
  }

  return {
    GITHUB_OWNER,
    GITHUB_REPO,
    GITHUB_BRANCH,
    utf8ToBase64,
    base64ToUtf8,
    escapeHtml,
    formatDate,
    serializeDoc,
    setupAuthGate,
    getStoredPassword,
    setStoredPassword,
    isAuthenticated,
    requireAuthOrRedirect,
    setupTokenPersistence,
    githubRequest,
    loadFileDoc,
    saveFileDoc,
    insertSnippetIntoFile,
    setupCopyButton,
    renderPostRow,
    fileToBase64,
    getFileSha,
    putBinaryFile,
    loadImageDimensions,
    buildSvgWrapper,
    buildUploadBlob,
    replaceImageAtPath,
  };
})();

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

  function setupAuthGate(password) {
    const authGate = document.getElementById('authGate');
    const authForm = document.getElementById('authForm');
    const authError = document.getElementById('authError');
    const adminMain = document.getElementById('adminMain');

    authForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const value = document.getElementById('authPassword').value;
      if (value === password) {
        authGate.classList.add('is-hidden');
        adminMain.classList.remove('is-hidden');
      } else {
        authError.textContent = 'パスワードが違います。';
      }
    });
  }

  function setupTokenPersistence(inputEl, storageKey, statusEl) {
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      inputEl.value = saved;
      if (statusEl) statusEl.textContent = 'このセッションで保存されたトークンを使用します。';
    }
    inputEl.addEventListener('input', () => {
      sessionStorage.setItem(storageKey, inputEl.value);
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
    setupTokenPersistence,
    githubRequest,
    loadFileDoc,
    saveFileDoc,
    insertSnippetIntoFile,
    setupCopyButton,
    renderPostRow,
  };
})();

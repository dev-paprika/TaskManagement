// ===== STATE =====

let currentUser = null;
let columns = [];
let globalTags = [];   // 全ユーザーが作成したタグの一覧
let nextColId = 1;
let nextCardId = 1;
let editingCardId = null;
let dragCardId = null;
let confirmCallback = null;
let modalTempTags = [];
let inlineTempTags = []; // カード追加フォーム用（同時に1つしか開かない前提）

const TAG_COLORS = [
  'tag-color-0',
  'tag-color-1',
  'tag-color-2',
  'tag-color-3',
  'tag-color-4',
  'tag-color-5',
];

// ===== SCREEN NAVIGATION =====

function showScreen(name) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById('screen-' + name).classList.add('active');
}

// ===== AUTH =====

function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass = document.getElementById('login-password').value;
  const err = document.getElementById('login-error');
  err.classList.remove('visible');

  if (!email || !pass || !email.includes('@') || pass.length < 8) {
    err.classList.add('visible');
    return;
  }

  currentUser = email;
  document.getElementById('user-email-display').textContent = email;
  initBoard();
  showScreen('board');
}

function doSignup() {
  const email = document.getElementById('signup-email').value.trim();
  const pass = document.getElementById('signup-password').value;
  const pass2 = document.getElementById('signup-password2').value;
  const err = document.getElementById('signup-error');
  err.classList.remove('visible');

  if (!email || !email.includes('@')) {
    err.textContent = '❌ 正しいメールアドレスを入力してください';
    err.classList.add('visible');
    return;
  }
  if (pass.length < 8) {
    err.textContent = '❌ パスワードは8文字以上で入力してください';
    err.classList.add('visible');
    return;
  }
  if (pass !== pass2) {
    err.textContent = '❌ パスワードが一致しません';
    err.classList.add('visible');
    return;
  }

  currentUser = email;
  document.getElementById('user-email-display').textContent = email;
  initBoard();
  showScreen('board');
}

function doLogout() {
  closeUserMenu();
  currentUser = null;
  columns = [];
  globalTags = [];
  nextColId = 1;
  nextCardId = 1;
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').classList.remove('visible');
  showScreen('login');
}

// ===== USER MENU =====

function toggleUserMenu() {
  document.getElementById('user-menu-dropdown').classList.toggle('open');
}

function closeUserMenu() {
  document.getElementById('user-menu-dropdown').classList.remove('open');
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.user-menu-wrap')) closeUserMenu();
});

// ===== DATE UTILITIES =====

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function formatDueDate(dateStr) {
  if (!dateStr) return null;
  const due = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((due - today) / (1000 * 60 * 60 * 24));

  if (diff < 0)  return { text: `${Math.abs(diff)}日超過`, status: 'overdue' };
  if (diff === 0) return { text: '今日',                  status: 'today' };
  if (diff === 1) return { text: '明日',                  status: 'soon' };
  if (diff <= 3)  return { text: `${diff}日後`,           status: 'soon' };

  const m = due.getMonth() + 1;
  const d = due.getDate();
  return { text: `${m}月${d}日`, status: 'future' };
}

// ===== TAG MANAGEMENT =====

// テキストが既存タグと一致すればそのcolorIdxを返し、新規なら登録して返す
function ensureGlobalTag(text) {
  const existing = globalTags.find((t) => t.text === text);
  if (existing) return existing.colorIdx;
  const colorIdx = globalTags.length % TAG_COLORS.length;
  globalTags.push({ text, colorIdx });
  return colorIdx;
}

// 全カードのタグをglobalTagsに収集する（初期化時用）
function collectTagsFromCards() {
  columns.forEach((col) => {
    col.cards.forEach((card) => {
      card.tags.forEach((tag) => {
        if (!globalTags.some((t) => t.text === tag.text)) {
          globalTags.push({ text: tag.text, colorIdx: tag.colorIdx });
        }
      });
    });
  });
}

// ===== BOARD INIT =====

function initBoard() {
  columns = [];
  globalTags = [];
  nextColId = 1;
  nextCardId = 1;

  ['Todo', 'In Progress', 'Done'].forEach((name) => {
    columns.push({ id: nextColId++, name, cards: [] });
  });

  // デモ用サンプルカード
  columns[0].cards.push({
    id: nextCardId++,
    title: 'ログイン画面のデザイン',
    tags: [{ text: 'デザイン', colorIdx: 1 }],
    dueDate: offsetDate(-1),  // 昨日（期限超過）
  });
  columns[0].cards.push({
    id: nextCardId++,
    title: '要件定義書のレビュー',
    tags: [{ text: 'ドキュメント', colorIdx: 3 }],
    dueDate: offsetDate(0),   // 今日
  });
  columns[1].cards.push({
    id: nextCardId++,
    title: 'データベース設計',
    tags: [{ text: 'バックエンド', colorIdx: 4 }],
    dueDate: offsetDate(2),   // 2日後（もうすぐ）
  });
  columns[2].cards.push({
    id: nextCardId++,
    title: 'プロジェクトセットアップ',
    tags: [],
    dueDate: null,
  });

  // デモカードのタグをglobalTagsへ登録
  collectTagsFromCards();

  renderBoard();
}

// ===== RENDER =====

function renderBoard() {
  const board = document.getElementById('board');
  const addBtn = board.querySelector('.add-column-btn');

  board.querySelectorAll('.column').forEach((el) => el.remove());

  columns.forEach((col) => {
    board.insertBefore(buildColumnEl(col), addBtn);
  });
}

function buildColumnEl(col) {
  const el = document.createElement('div');
  el.className = 'column';
  el.dataset.colId = col.id;

  const header = document.createElement('div');
  header.className = 'column-header';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'column-title';
  titleSpan.textContent = col.name;

  const titleInput = document.createElement('input');
  titleInput.className = 'column-title-input';
  titleInput.value = col.name;

  titleSpan.onclick = () => startColumnEdit(col.id, titleSpan, titleInput);
  titleInput.onblur = () => finishColumnEdit(col.id, titleSpan, titleInput);
  titleInput.onkeydown = (e) => {
    if (e.key === 'Enter') titleInput.blur();
    if (e.key === 'Escape') {
      titleInput.value = col.name;
      titleInput.blur();
    }
  };

  const delBtn = document.createElement('button');
  delBtn.className = 'column-delete-btn';
  delBtn.title = 'カラムを削除';
  delBtn.textContent = '✕';
  delBtn.onclick = () => confirmDeleteColumn(col.id);

  header.appendChild(titleSpan);
  header.appendChild(titleInput);
  header.appendChild(delBtn);

  const cardsArea = document.createElement('div');
  cardsArea.className = 'cards-area';
  cardsArea.dataset.colId = col.id;

  if (col.cards.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'タスクはありません';
    cardsArea.appendChild(empty);
  } else {
    col.cards.forEach((card) => cardsArea.appendChild(buildCardEl(card)));
  }

  cardsArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    cardsArea.classList.add('drag-over');
  });
  cardsArea.addEventListener('dragleave', () => cardsArea.classList.remove('drag-over'));
  cardsArea.addEventListener('drop', (e) => {
    e.preventDefault();
    cardsArea.classList.remove('drag-over');
    if (dragCardId) moveCardToColumn(dragCardId, col.id);
  });

  const addArea = buildAddCardArea(col.id);

  el.appendChild(header);
  el.appendChild(cardsArea);
  el.appendChild(addArea);

  return el;
}

function buildCardEl(card) {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.cardId = card.id;
  el.draggable = true;

  el.addEventListener('dragstart', () => {
    dragCardId = card.id;
    setTimeout(() => el.classList.add('dragging'), 0);
  });
  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    dragCardId = null;
  });
  el.onclick = (e) => {
    if (e.target.closest('.card-delete-btn')) return;
    openModal(card.id);
  };

  const delBtn = document.createElement('button');
  delBtn.className = 'card-delete-btn';
  delBtn.title = 'カードを削除';
  delBtn.textContent = '✕';
  delBtn.onclick = (e) => {
    e.stopPropagation();
    confirmDeleteCard(card.id);
  };

  const titleEl = document.createElement('div');
  titleEl.className = 'card-title';
  titleEl.textContent = card.title;

  el.appendChild(delBtn);
  el.appendChild(titleEl);

  if (card.tags && card.tags.length > 0) {
    const tagsEl = document.createElement('div');
    tagsEl.className = 'card-tags';
    card.tags.forEach((tag) => {
      const t = document.createElement('span');
      t.className = 'tag ' + TAG_COLORS[tag.colorIdx % TAG_COLORS.length];
      t.textContent = tag.text;
      tagsEl.appendChild(t);
    });
    el.appendChild(tagsEl);
  }

  if (card.dueDate) {
    const fmt = formatDueDate(card.dueDate);
    if (fmt) {
      const badge = document.createElement('div');
      badge.className = `due-date-badge due-date-badge--${fmt.status}`;
      badge.textContent = `📅 ${fmt.text}`;
      el.appendChild(badge);
    }
  }

  return el;
}

// タグ選択ピルを描画する汎用関数
// container: 描画先のDOM要素
// getTempTags: 現在の選択タグ配列を返す関数
// onUpdate: 選択変更後に呼ぶコールバック
function renderTagPills(container, getTempTags, onUpdate) {
  container.innerHTML = '';

  if (globalTags.length === 0) return;

  globalTags.forEach((tag) => {
    const pill = document.createElement('span');
    const colorClass = TAG_COLORS[tag.colorIdx % TAG_COLORS.length];
    pill.className = `tag-suggestion ${colorClass}`;
    pill.textContent = tag.text;

    const isSelected = getTempTags().some((t) => t.text === tag.text);
    if (isSelected) pill.classList.add('selected');

    pill.onclick = () => {
      const tempTags = getTempTags();
      const idx = tempTags.findIndex((t) => t.text === tag.text);
      if (idx !== -1) {
        tempTags.splice(idx, 1);
      } else {
        tempTags.push({ ...tag });
      }
      onUpdate();
    };

    container.appendChild(pill);
  });
}

function buildAddCardArea(colId) {
  const addArea = document.createElement('div');
  addArea.className = 'add-card-area';

  const inputWrap = document.createElement('div');
  inputWrap.className = 'add-card-input-wrap';

  const textarea = document.createElement('textarea');
  textarea.className = 'add-card-input';
  textarea.placeholder = 'タスクのタイトルを入力…';

  // ----- インラインタグセクション -----
  const inlineTagsSection = document.createElement('div');
  inlineTagsSection.className = 'inline-tags-section';

  const tagPillsRow = document.createElement('div');
  tagPillsRow.className = 'inline-tags-row';

  const newTagInputRow = document.createElement('div');
  newTagInputRow.className = 'new-tag-inline-input-row';

  const newTagInput = document.createElement('input');
  newTagInput.className = 'new-tag-inline-input';
  newTagInput.placeholder = '新しいタグ名';

  const newTagConfirmBtn = document.createElement('button');
  newTagConfirmBtn.type = 'button';
  newTagConfirmBtn.className = 'btn-new-tag-confirm';
  newTagConfirmBtn.textContent = '追加';

  newTagInputRow.appendChild(newTagInput);
  newTagInputRow.appendChild(newTagConfirmBtn);

  function renderInlinePills() {
    renderTagPills(tagPillsRow, () => inlineTempTags, () => {
      // ボタンを再追加するため再描画
      appendNewTagBtn();
    });
    appendNewTagBtn();
  }

  function appendNewTagBtn() {
    // 既存の「＋ 新規」ボタンを削除して追加し直す
    const existing = tagPillsRow.querySelector('.btn-new-tag-inline');
    if (existing) existing.remove();

    const newTagBtn = document.createElement('button');
    newTagBtn.type = 'button';
    newTagBtn.className = 'btn-new-tag-inline';
    newTagBtn.textContent = '＋ 新規';
    newTagBtn.onclick = () => {
      newTagInputRow.classList.add('open');
      newTagInput.focus();
    };
    tagPillsRow.appendChild(newTagBtn);
  }

  function addNewInlineTag() {
    const text = newTagInput.value.trim();
    if (!text) return;
    const colorIdx = ensureGlobalTag(text);
    if (!inlineTempTags.some((t) => t.text === text)) {
      inlineTempTags.push({ text, colorIdx });
    }
    newTagInput.value = '';
    newTagInputRow.classList.remove('open');
    renderInlinePills();
  }

  newTagConfirmBtn.onclick = addNewInlineTag;
  newTagInput.onkeydown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addNewInlineTag(); }
    if (e.key === 'Escape') {
      newTagInputRow.classList.remove('open');
      newTagInput.value = '';
    }
  };

  inlineTagsSection.appendChild(tagPillsRow);
  inlineTagsSection.appendChild(newTagInputRow);
  // ----- インラインタグセクション ここまで -----

  // ----- インライン期限日入力 -----
  const inlineDateRow = document.createElement('div');
  inlineDateRow.className = 'inline-date-row';

  const inlineDateLabel = document.createElement('span');
  inlineDateLabel.className = 'inline-date-label';
  inlineDateLabel.textContent = '期限日:';

  const inlineDateInput = document.createElement('input');
  inlineDateInput.type = 'date';
  inlineDateInput.className = 'inline-date-input';

  inlineDateRow.appendChild(inlineDateLabel);
  inlineDateRow.appendChild(inlineDateInput);
  // ----- インライン期限日入力 ここまで -----

  textarea.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      confirmAddCard(colId, textarea, inlineDateInput, inputWrap, addBtn);
    }
    if (e.key === 'Escape') cancelAddCard(textarea, inputWrap, addBtn);
  };

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'add-card-actions';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn-add-confirm';
  confirmBtn.textContent = 'カードを追加';
  confirmBtn.onclick = () => confirmAddCard(colId, textarea, inlineDateInput, inputWrap, addBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn-add-cancel';
  cancelBtn.textContent = '✕';
  cancelBtn.onclick = () => cancelAddCard(textarea, inputWrap, addBtn);

  actionsDiv.appendChild(confirmBtn);
  actionsDiv.appendChild(cancelBtn);

  inputWrap.appendChild(textarea);
  inputWrap.appendChild(inlineTagsSection);
  inputWrap.appendChild(inlineDateRow);
  inputWrap.appendChild(actionsDiv);

  const addBtn = document.createElement('button');
  addBtn.className = 'btn-add-card';
  addBtn.innerHTML = '<span>＋</span> カード追加';
  addBtn.onclick = () => {
    inlineTempTags = [];
    inlineDateInput.value = '';
    renderInlinePills();
    inputWrap.classList.add('open');
    addBtn.style.display = 'none';
    textarea.value = '';
    textarea.focus();
  };

  addArea.appendChild(inputWrap);
  addArea.appendChild(addBtn);

  return addArea;
}

// ===== COLUMN EDIT =====

function startColumnEdit(colId, span, input) {
  span.style.display = 'none';
  input.style.display = 'block';
  input.focus();
  input.select();
}

function finishColumnEdit(colId, span, input) {
  const newName = input.value.trim();
  const col = columns.find((c) => c.id === colId);
  if (col && newName) col.name = newName;
  span.textContent = col ? col.name : input.value;
  input.style.display = 'none';
  span.style.display = '';
}

// ===== COLUMN ADD / DELETE =====

function addColumn() {
  const name = prompt('新しいカラム名を入力してください');
  if (!name || !name.trim()) return;
  columns.push({ id: nextColId++, name: name.trim(), cards: [] });
  renderBoard();
}

function confirmDeleteColumn(colId) {
  const col = columns.find((c) => c.id === colId);
  if (!col) return;
  showConfirm(
    'カラムを削除',
    `「${col.name}」を削除すると、中のカード（${col.cards.length}件）もすべて削除されます。よろしいですか？`,
    () => {
      columns = columns.filter((c) => c.id !== colId);
      renderBoard();
    }
  );
}

// ===== CARD ADD / DELETE =====

function cancelAddCard(textarea, inputWrap, addBtn) {
  inputWrap.classList.remove('open');
  addBtn.style.display = '';
}

function confirmAddCard(colId, textarea, dateInput, inputWrap, addBtn) {
  const title = textarea.value.trim();
  if (!title) return;
  const col = columns.find((c) => c.id === colId);
  if (col) {
    col.cards.push({
      id: nextCardId++,
      title,
      tags: [...inlineTempTags],
      dueDate: dateInput.value || null,
    });
  }
  inlineTempTags = [];
  inputWrap.classList.remove('open');
  addBtn.style.display = '';
  renderBoard();
}

function confirmDeleteCard(cardId) {
  let cardTitle = '';
  columns.forEach((col) => {
    const c = col.cards.find((c) => c.id === cardId);
    if (c) cardTitle = c.title;
  });
  showConfirm('カードを削除', `「${cardTitle}」を削除しますか？`, () => {
    columns.forEach((col) => {
      col.cards = col.cards.filter((c) => c.id !== cardId);
    });
    renderBoard();
  });
}

// ===== DRAG & DROP =====

function moveCardToColumn(cardId, targetColId) {
  let card = null;
  columns.forEach((col) => {
    const idx = col.cards.findIndex((c) => c.id === cardId);
    if (idx !== -1) card = col.cards.splice(idx, 1)[0];
  });
  if (card) {
    const target = columns.find((c) => c.id === targetColId);
    if (target) target.cards.push(card);
  }
  renderBoard();
}

// ===== MODAL =====

function openModal(cardId) {
  let card = null;
  columns.forEach((col) => {
    const c = col.cards.find((c) => c.id === cardId);
    if (c) card = c;
  });
  if (!card) return;

  editingCardId = cardId;
  document.getElementById('modal-title-input').value = card.title;
  document.getElementById('modal-date-input').value = card.dueDate || '';
  modalTempTags = card.tags ? card.tags.map((t) => ({ ...t })) : [];
  renderModalTagSuggestions();
  document.getElementById('tag-input').value = '';
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('modal-title-input').focus();
}

function closeModal() {
  editingCardId = null;
  document.getElementById('modal-overlay').classList.remove('open');
}

function onOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}

function saveCard() {
  const title = document.getElementById('modal-title-input').value.trim();
  if (!title) return;
  const dueDate = document.getElementById('modal-date-input').value || null;
  columns.forEach((col) => {
    const card = col.cards.find((c) => c.id === editingCardId);
    if (card) {
      card.title = title;
      card.dueDate = dueDate;
      card.tags = [...modalTempTags];
    }
  });
  closeModal();
  renderBoard();
}

function clearModalDate() {
  document.getElementById('modal-date-input').value = '';
}

function renderModalTagSuggestions() {
  const container = document.getElementById('modal-tag-suggestions');
  renderTagPills(container, () => modalTempTags, renderModalTagSuggestions);
}

function addTagFromInput() {
  const input = document.getElementById('tag-input');
  const text = input.value.trim();
  if (!text) return;
  const colorIdx = ensureGlobalTag(text);
  if (!modalTempTags.some((t) => t.text === text)) {
    modalTempTags.push({ text, colorIdx });
  }
  input.value = '';
  renderModalTagSuggestions();
  input.focus();
}

function onTagInputKey(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addTagFromInput();
  }
}

// ===== CONFIRM DIALOG =====

function showConfirm(title, message, onOk) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;
  confirmCallback = onOk;
  document.getElementById('confirm-ok-btn').onclick = () => {
    closeConfirm();
    if (confirmCallback) confirmCallback();
  };
  document.getElementById('confirm-overlay').classList.add('open');
}

function closeConfirm() {
  document.getElementById('confirm-overlay').classList.remove('open');
  confirmCallback = null;
}

// ===== KEYBOARD SHORTCUTS =====

document.getElementById('login-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doLogin();
});
document.getElementById('signup-password2').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doSignup();
});

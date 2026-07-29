const state = { members: [], roles: [], edges: {}, priorities: {} };
const storageKey = 'matchwork-project-v1';
const hiddenRanks = new Set();

function shuffled(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]];
  }
  return copy;
}

const $ = (selector) => document.querySelector(selector);
const memberList = $('#member-list');
const roleList = $('#role-list');

function addItem(type, value) {
  const name = value.trim();
  const list = state[type];
  if (!name || list.includes(name)) return;
  list.push(name);
  if (type === 'members') { state.edges[name] = {}; state.priorities[name] = {}; }
  render();
}

function removeItem(type, value) {
  state[type] = state[type].filter((item) => item !== value);
  if (type === 'members') { delete state.edges[value]; delete state.priorities[value]; }
  if (type === 'roles') {
    state.members.forEach((member) => {
      delete state.edges[member]?.[value];
      delete state.priorities[member]?.[value];
    });
    normalizePriorities();
  }
  render();
}

function normalizePriorities() {
  const rankLimit = state.roles.length;
  state.members.forEach((member) => {
    const preferences = state.priorities[member] || {};
    const rankedRoles = state.roles
      .filter((role) => preferences[role])
      .sort((first, second) => preferences[first] - preferences[second]);
    state.priorities[member] = {};
    rankedRoles.forEach((role, index) => {
      state.priorities[member][role] = Math.min(index + 1, rankLimit);
    });
  });
}

function renderTags(type, container) {
  container.replaceChildren();
  state[type].forEach((item) => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.append(document.createTextNode(item));
    const remove = document.createElement('button');
    remove.className = 'delete';
    remove.type = 'button';
    remove.ariaLabel = `${item} 삭제`;
    remove.textContent = '×';
    remove.addEventListener('click', () => removeItem(type, item));
    tag.append(remove);
    container.append(tag);
  });
}

function renderMatrix() {
  const empty = $('#matrix-empty');
  const wrap = $('#matrix-wrap');
  if (!state.members.length || !state.roles.length) {
    empty.hidden = false;
    wrap.hidden = true;
    wrap.replaceChildren();
    return;
  }
  empty.hidden = true;
  wrap.hidden = false;
  const table = document.createElement('table');
  table.className = 'matrix';
  const head = document.createElement('thead');
  const headRow = document.createElement('tr');
   $('#priority-hint').textContent = `각 학생의 역할을 1순위부터 ${state.roles.length}순위까지 정할 수 있습니다. 같은 순위는 한 번만 선택됩니다.`;
   const corner = document.createElement('th');
   corner.textContent = '팀원 / 역할 우선순위';
  headRow.append(corner);
  state.roles.forEach((role) => { const th = document.createElement('th'); th.textContent = role; headRow.append(th); });
  head.append(headRow);
  const body = document.createElement('tbody');
  state.members.forEach((member) => {
    const row = document.createElement('tr');
    const label = document.createElement('td'); label.textContent = member; row.append(label);
    state.roles.forEach((role) => {
      const cell = document.createElement('td');
      const select = document.createElement('select');
      select.className = 'priority-select';
      select.ariaLabel = `${member}의 ${role} 우선순위`;
      [['', '선택 안 함'], ...state.roles.map((_, index) => [String(index + 1), `${index + 1}순위`])].forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value; option.textContent = label;
        select.append(option);
      });
      select.value = state.priorities[member]?.[role] || '';
      select.addEventListener('change', () => setPriority(member, role, select.value));
      cell.append(select); row.append(cell);
    });
    body.append(row);
  });
  table.append(head, body);
  wrap.replaceChildren(table);
}

function setPriority(member, role, value) {
  state.edges[member] ??= {};
  state.priorities[member] ??= {};
  if (!value) {
    delete state.edges[member][role];
    delete state.priorities[member][role];
  } else {
    Object.entries(state.priorities[member]).forEach(([assignedRole, rank]) => {
      if (String(rank) === value && assignedRole !== role) {
        delete state.priorities[member][assignedRole];
        delete state.edges[member][assignedRole];
      }
    });
    state.edges[member][role] = true;
    state.priorities[member][role] = Number(value);
  }
  renderMatrix();
  renderGraph();
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function renderGraph() {
  const empty = $('#graph-empty');
  const wrap = $('#graph-wrap');
  const svg = $('#matching-graph');
  if (!state.members.length || !state.roles.length) {
    empty.hidden = false;
    wrap.hidden = true;
    svg.replaceChildren();
    return;
  }

  empty.hidden = true;
  wrap.hidden = false;
  const nodeGap = 74;
  const height = Math.max(300, Math.max(state.members.length, state.roles.length) * nodeGap + 72);
  const width = 900;
  const leftX = 142;
  const rightX = 758;
  const positions = (items, x) => Object.fromEntries(items.map((item, index) => [item, {
    x,
    y: (height - (items.length - 1) * nodeGap) / 2 + index * nodeGap,
  }]));
  const members = positions(state.members, leftX);
  const roles = positions(state.roles, rightX);
  const defs = svgElement('defs');
  const rankColors = getRankColors(state.roles.length);
  [['arrowhead', '#a5dde0'], ...rankColors.map((color, index) => [`arrowhead-${index + 1}`, color])].forEach(([id, color]) => {
    const marker = svgElement('marker', { id, markerWidth: '10', markerHeight: '10', refX: '8', refY: '3', orient: 'auto', markerUnits: 'strokeWidth' });
    marker.append(svgElement('path', { d: 'M0,0 L0,6 L9,3 z', fill: color }));
    defs.append(marker);
  });
  svg.replaceChildren(defs);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const edges = [];
  state.members.forEach((member) => {
    state.roles.forEach((role) => {
      if (!state.edges[member]?.[role]) return;
      const start = members[member];
      const end = roles[role];
      const curve = (end.y - start.y) * 0.18;
      const rank = state.priorities[member]?.[role];
      // Do not add filtered rank edges to the SVG: inline rank colors would override CSS opacity.
      if (rank && hiddenRanks.has(rank)) return;
      const path = svgElement('path', {
        d: `M ${start.x + 80} ${start.y} C 385 ${start.y + curve}, 515 ${end.y - curve}, ${end.x - 84} ${end.y}`,
        class: 'graph-edge',
        style: rank ? `stroke:${rankColors[rank - 1]};stroke-width:${Math.max(2.5, 4.5 - rank * 0.18)};opacity:1` : '',
        'marker-end': `url(#arrowhead${rank ? `-${rank}` : ''})`,
      });
      svg.append(path);
      edges.push({ member, role, start, end, curve, rank });
    });
  });

  const addNode = (label, point, type) => {
    const group = svgElement('g', { class: `graph-node ${type}` });
    group.append(svgElement('rect', { x: point.x - 80, y: point.y - 23, width: 160, height: 46, rx: 12 }));
    const text = svgElement('text', { x: point.x, y: point.y + 5, 'text-anchor': 'middle' });
    text.textContent = label;
    group.append(text);
    svg.append(group);
  };
  state.members.forEach((member) => addNode(member, members[member], 'member-node'));
  state.roles.forEach((role) => addNode(role, roles[role], 'role-node'));
  renderLegend(rankColors);
}

function getRankColors(count) {
  return Array.from({ length: count }, (_, index) => `hsl(${270 - (index * 175 / Math.max(count - 1, 1))} 84% ${index === 0 ? 59 : 47 + index * 4}%)`);
}

function renderLegend(colors) {
  const legend = $('#graph-legend');
  legend.replaceChildren();
  const addItem = (className, label, color) => {
    const item = document.createElement('span');
    const mark = document.createElement('i');
    mark.className = className;
    if (color) mark.style.background = color;
    item.append(mark, document.createTextNode(label));
    legend.append(item);
  };
  addItem('legend-node member-dot', '팀원 정점');
  addItem('legend-arrow', '가능한 배정 간선');
  colors.forEach((color, index) => {
    const rank = index + 1;
    const button = document.createElement('button');
    button.className = `legend-rank-button${hiddenRanks.has(rank) ? ' is-off' : ''}`;
    button.type = 'button';
    button.setAttribute('aria-pressed', String(!hiddenRanks.has(rank)));
    button.setAttribute('aria-label', `${rank}순위 ${hiddenRanks.has(rank) ? '표시' : '숨기기'}`);
    const mark = document.createElement('i');
    mark.className = 'legend-rank';
    mark.style.background = color;
    button.append(mark, document.createTextNode(`${rank}순위`));
    button.addEventListener('click', () => {
      if (hiddenRanks.has(rank)) hiddenRanks.delete(rank);
      else hiddenRanks.add(rank);
      renderGraph();
    });
    legend.append(button);
  });
  addItem('legend-node role-dot', '역할 정점');
}

function render() {
  $('#member-count').textContent = state.members.length;
  $('#role-count').textContent = state.roles.length;
  renderTags('members', memberList);
  renderTags('roles', roleList);
  renderMatrix();
  renderGraph();
}

function findMatching() {
  const used = new Set();
  const assignment = {};
  let bestAssignment = null;
  let bestScore = -1;
  const orderedMembers = shuffled(state.members).sort((a, b) => available(a).length - available(b).length);
  function available(member) { return state.roles.filter((role) => state.edges[member]?.[role]); }
  function search(index, score) {
    if (index === orderedMembers.length) {
      if (score > bestScore || (score === bestScore && bestAssignment && Math.random() < 0.5)) {
        bestScore = score;
        bestAssignment = { ...assignment };
      }
      return;
    }
    const member = orderedMembers[index];
    const rankedRoles = shuffled(available(member)).sort((first, second) =>
      (state.priorities[member]?.[first] || state.roles.length) - (state.priorities[member]?.[second] || state.roles.length),
    );
    for (const role of rankedRoles) {
      if (used.has(role)) continue;
      used.add(role); assignment[member] = role;
      const rank = Math.min(state.priorities[member]?.[role] || state.roles.length, state.roles.length);
      search(index + 1, score + (state.roles.length + 1 - rank));
      used.delete(role); delete assignment[member];
    }
  }
  search(0, 0);
  return bestAssignment;
}

async function showResult() {
  const section = $('#result-section');
  const message = $('#result-message');
  const list = $('#result-list');
  section.hidden = false; list.replaceChildren(); message.className = 'result-message';
  if (!state.members.length || !state.roles.length) {
    $('#result-title').textContent = '입력이 더 필요합니다';
    message.textContent = '팀원과 역할을 각각 하나 이상 입력해 주세요.'; message.classList.add('error'); return;
  }
  if (state.members.length !== state.roles.length) {
    $('#result-title').textContent = '1:1 배정 조건 확인';
    message.textContent = `현재 팀원 ${state.members.length}명, 역할 ${state.roles.length}개입니다. 1:1 매칭을 위해 수를 같게 맞춰 주세요.`; message.classList.add('error'); return;
  }
  let match;
  try {
    const response = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    });
    if (!response.ok) throw new Error('Matching request failed');
    ({ match } = await response.json());
  } catch {
    // Let the page keep working when opened directly without the FastAPI server.
    match = findMatching();
  }
  if (!match) {
    $('#result-title').textContent = '완전 매칭을 찾지 못했습니다';
    message.textContent = '연결 조건으로는 모든 팀원에게 서로 다른 역할을 배정할 수 없습니다. 체크한 가능 역할을 늘려 다시 시도해 보세요.'; message.classList.add('error'); return;
  }
  $('#result-title').textContent = '완전 매칭을 찾았습니다!';
  message.textContent = '모든 팀원이 중복 없이 하나의 역할에 연결되었습니다.';
  state.members.forEach((member) => {
    const pair = document.createElement('div'); pair.className = 'result-pair';
    const memberName = document.createElement('span'); memberName.textContent = member;
    const arrow = document.createElement('span'); arrow.className = 'arrow'; arrow.textContent = '→';
    const roleName = document.createElement('span'); roleName.className = 'role'; roleName.textContent = match[member];
    pair.append(memberName, arrow, roleName);
    list.append(pair);
  });
  section.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

$('#member-form').addEventListener('submit', (event) => { event.preventDefault(); addItem('members', $('#member-input').value); $('#member-input').value = ''; $('#member-input').focus(); });
$('#role-form').addEventListener('submit', (event) => { event.preventDefault(); addItem('roles', $('#role-input').value); $('#role-input').value = ''; $('#role-input').focus(); });
$('#match-button').addEventListener('click', () => { void showResult(); });
$('#reset-button').addEventListener('click', () => {
  state.members = [];
  state.roles = [];
  state.edges = {};
  state.priorities = {};
  hiddenRanks.clear();
  $('#result-section').hidden = true;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
$('#save-button').addEventListener('click', () => {
  localStorage.setItem(storageKey, JSON.stringify(state));
  $('#save-button').innerHTML = '저장 완료 <span>✓</span>';
  window.setTimeout(() => { $('#save-button').innerHTML = '현재 데이터 저장 <span>↓</span>'; }, 1600);
});
$('#load-button').addEventListener('click', () => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) { window.alert('이 브라우저에 저장된 데이터가 아직 없습니다.'); return; }
  try {
    const data = JSON.parse(saved);
    if (!Array.isArray(data.members) || !Array.isArray(data.roles)) throw new Error('Invalid saved data');
    state.members = data.members;
    state.roles = data.roles;
    state.edges = data.edges || {};
    state.priorities = data.priorities || {};
    normalizePriorities();
    $('#result-section').hidden = true;
    render();
  } catch { window.alert('저장된 데이터를 불러올 수 없습니다.'); }
});
$('#sample-button').addEventListener('click', () => {
  state.members = ['학생 A', '학생 B', '학생 C']; state.roles = ['발표', '자료조사', '디자인'];
  state.edges = { '학생 A': { 발표: true, 자료조사: true }, '학생 B': { 자료조사: true, 디자인: true }, '학생 C': { 발표: true, 디자인: true } };
  state.priorities = { '학생 A': { 발표: 1, 자료조사: 2 }, '학생 B': { 자료조사: 1, 디자인: 2 }, '학생 C': { 디자인: 1, 발표: 2 } };
  $('#result-section').hidden = true; render();
});

// 순수 운(1/N 확률) 기반 1:1 무작위 배정 함수
function findPureRandomMatching() {
  const used = new Set();
  const assignment = {};

  // 1. 팀원 순서를 순전히 운(100% 무작위)으로 섞기
  const orderedMembers = shuffled(state.members);

  function available(member) {
    return state.roles.filter((role) => state.edges[member]?.[role]);
  }

  function search(index) {
    if (index === orderedMembers.length) {
      return true; // 모두 무사히 역할을 배정받음
    }

    const member = orderedMembers[index];
    const memberRoles = available(member);

    // 2. 원하는 역할들도 순전히 운으로 섞은 뒤 우선순위(1~5순위) 순으로 정렬
    // (우선순위가 같거나 겹치면 shuffled 결과에 의해 1/N 순수한 운으로 결정됨)
    const rankedRoles = shuffled(memberRoles).sort((first, second) => {
      const r1 = state.priorities[member]?.[first] || state.roles.length;
      const r2 = state.priorities[member]?.[second] || state.roles.length;
      return r1 - r2;
    });

    for (const role of rankedRoles) {
      if (used.has(role)) continue;

      used.add(role);
      assignment[member] = role;

      if (search(index + 1)) return true;

      // 실패 시 백트래킹 (원상복구)
      used.delete(role);
      delete assignment[member];
    }

    return false;
  }

  const success = search(0);
  return success ? assignment : null;
}

render();

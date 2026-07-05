const STORAGE_KEY = "colthevaya-save-v6";

const stationScenes = ["forest", "ruin", "blood", "liminal", "hotel"];
const identities = {
  citizen: "소련의 인민",
  loyalist: "체제 유지에 기여하는 자",
  infiltrator: "행사에 숨어든 이물질",
};

const itemIcons = {
  "나침반": "compass.png",
  "풀": "grass.png",
  "통조림": "can.png",
  "붉은 알약": "pill-red.png",
  "푸른 알약": "pill-blue.png",
  "흰 알약": "pill-white.png",
  "수면제": "pill-white.png",
  "행복해지는 알약": "pill-blue.png",
  "물병": "water-bottle.png",
  "라디오": "radio.png",
  "총알": "bullet.png",
  "빵": "bread.png",
  "흑빵": "bread.png",
  "고깃덩이": "meat.png",
  "빨간색 무드등": "lamp-red.png",
  "노란색 무드등": "lamp-yellow.png",
  "파란색 무드등": "lamp-blue.png",
  "음료수": "drink.png",
  "음료": "drink.png",
  "붕대": "bandage.png",
  "소모품": "consumable.png",
  "핏물": "blood.png",
  "여성의 팔": "arm.png",
  "남성의 팔": "arm.png",
  "나뭇가지": "branch.png",
  "여성의 다리": "leg.png",
  "벌레": "bug.png",
  "바위": "rock.png",
  "현금": "cash.png",
  "솜": "cotton.png",
  "잭나이프": "knife.png",
  "도끼": "axe.png",
  "권총": "gun.png",
  "망가진 권총": "gun.png",
  "샷건": "gun.png",
  "진통제": "painkiller.png",
  "쿠키": "cookie.png",
  "락스": "bleach.png",
  "전화기": "telephone.png",
  "와인": "wine.png",
  "금반지": "ring-gold.png",
  "은반지": "ring-silver.png",
  "못": "bullet.png",
  "진흙": "mud.png",
  "치아": "tooth.png",
  "혓바닥": "tongue.png",
  "손톱 열 개 묶음": "nails.png",
  "꿀단지": "honey.png",
  "잼": "jam.png",
  "심장": "meat.png",
  "은색 클로시": "cloche.png",
  "눈": "eye.png",
  "위": "stomach.png",
  "소장": "intestine.png",
  "간": "stomach.png",
  "술병": "liquor.png",
  "앰플": "ampoule.png",
  "선홍빛 앰플": "ampoule-red.png",
  "피하주사": "injection.png",
  "밧줄": "rope.png",
  "종이 쪽지": "note.png",
};

const state = {
  screen: "cinematic",
  cinematicStage: "opening",
  identity: null,
  dayOffset: 0,
  stationIndex: 0,
  nodeId: null,
  health: 100,
  mental: 100,
  hunger: 100,
  inventory: {},
  history: [],
  visitedStations: [],
  terminal: false,
  lastEffects: [],
  selectedItem: null,
  blackMessage: "",
};

const els = {
  cinematicScreen: document.querySelector("#cinematicScreen"),
  cinematicLogo: document.querySelector("#cinematicLogo"),
  cinematicText: document.querySelector("#cinematicText"),
  cinematicChoices: document.querySelector("#cinematicChoices"),
  gameScreen: document.querySelector("#gameScreen"),
  blackScreen: document.querySelector("#blackScreen"),
  blackMessage: document.querySelector("#blackMessage"),
  storyPanel: document.querySelector("#storyPanel"),
  stationTitle: document.querySelector("#stationTitle"),
  currentDate: document.querySelector("#currentDate"),
  routeStatus: document.querySelector("#routeStatus"),
  nodeTitle: document.querySelector("#nodeTitle"),
  depthLabel: document.querySelector("#depthLabel"),
  dialogueBox: document.querySelector("#dialogueBox"),
  dialogueText: document.querySelector("#dialogueText"),
  dialogueHint: document.querySelector("#dialogueHint"),
  promptText: document.querySelector("#promptText"),
  resultText: document.querySelector("#resultText"),
  effectLog: document.querySelector("#effectLog"),
  choices: document.querySelector("#choices"),
  identityValue: document.querySelector("#identityValue"),
  healthValue: document.querySelector("#healthValue"),
  mentalValue: document.querySelector("#mentalValue"),
  hungerValue: document.querySelector("#hungerValue"),
  healthBar: document.querySelector("#healthBar"),
  mentalBar: document.querySelector("#mentalBar"),
  hungerBar: document.querySelector("#hungerBar"),
  inventoryList: document.querySelector("#inventoryList"),
  inventoryCount: document.querySelector("#inventoryCount"),
  historyList: document.querySelector("#historyList"),
  saveButton: document.querySelector("#saveButton"),
  resetButton: document.querySelector("#resetButton"),
  backButton: document.querySelector("#backButton"),
  vendingButton: document.querySelector("#vendingButton"),
  itemDialog: document.querySelector("#itemDialog"),
  itemDialogIcon: document.querySelector("#itemDialogIcon"),
  itemDialogTitle: document.querySelector("#itemDialogTitle"),
  itemDialogDescription: document.querySelector("#itemDialogDescription"),
  itemUseButton: document.querySelector("#itemUseButton"),
  itemCancelButton: document.querySelector("#itemCancelButton"),
};

const dialogue = {
  lines: [],
  index: 0,
  timer: null,
  typing: false,
  choicesReady: false,
  pending: null,
};

function dialogueLines(current, effects = state.lastEffects) {
  if (state.terminal) return ["지하철이 종점에 도착했다."];
  return [current.prompt, current.result, ...effects].filter(Boolean);
}

function queueDialogue(lines) {
  dialogue.pending = lines.filter(Boolean);
}

function stopDialogueTimer() {
  if (dialogue.timer) window.clearInterval(dialogue.timer);
  dialogue.timer = null;
  dialogue.typing = false;
}

function showDialogueLine() {
  stopDialogueTimer();
  dialogue.choicesReady = false;
  els.choices.classList.add("hidden");
  const fullText = dialogue.lines[dialogue.index] || "";
  let cursor = 0;
  els.dialogueText.textContent = "";
  els.dialogueHint.textContent = "클릭하면 문장 완성";
  dialogue.typing = true;
  dialogue.timer = window.setInterval(() => {
    cursor += 1;
    els.dialogueText.textContent = fullText.slice(0, cursor);
    if (cursor >= fullText.length) {
      stopDialogueTimer();
      els.dialogueHint.textContent = dialogue.index < dialogue.lines.length - 1
        ? "클릭하여 계속"
        : "클릭하여 선택지 보기";
    }
  }, 28);
}

function beginDialogue(lines) {
  dialogue.lines = lines.length ? lines : ["..."];
  dialogue.index = 0;
  showDialogueLine();
}

function advanceDialogue() {
  if (state.screen !== "game") return;
  if (dialogue.typing) {
    stopDialogueTimer();
    els.dialogueText.textContent = dialogue.lines[dialogue.index] || "";
    els.dialogueHint.textContent = dialogue.index < dialogue.lines.length - 1
      ? "클릭하여 계속"
      : "클릭하여 선택지 보기";
    return;
  }
  if (dialogue.index < dialogue.lines.length - 1) {
    dialogue.index += 1;
    showDialogueLine();
    return;
  }
  dialogue.choicesReady = true;
  els.dialogueHint.textContent = "선택지를 고르세요";
  els.choices.classList.remove("hidden");
}

function station() {
  return window.GAME_DATA.stations[state.stationIndex];
}

function node() {
  return station().nodes[state.nodeId || station().root];
}

function clampStat(value) {
  return Math.max(0, Math.min(100, value));
}

function formatDate() {
  const date = new Date(Date.UTC(1950, 0, 1 + state.dayOffset));
  return `${date.getUTCFullYear()}년 ${date.getUTCMonth() + 1}월 ${date.getUTCDate()}일`;
}

function signed(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function statLabel(key) {
  return { health: "체력", mental: "정신력", hunger: "허기" }[key] || key;
}

function applyStatChange(key, amount, log) {
  if (!amount) return;
  state[key] = clampStat((state[key] ?? 100) + amount);
  log.push(`${statLabel(key)} ${signed(amount)}`);
}

function beginInvestigation(log) {
  state.dayOffset += 1;
  applyStatChange("hunger", -10, log);
  log.push(`${formatDate()} - 하루 경과`);
  // Future story hook: trigger a story scene whenever dayOffset % 3 === 0.
}

function applyEffects(effects, extra = []) {
  const log = [...extra];
  Object.entries(effects.stats || {}).forEach(([key, amount]) => applyStatChange(key, amount, log));
  Object.entries(effects.items || {}).forEach(([name, amount]) => {
    changeItem(name, amount);
    log.push(`${name} ${signed(amount)}`);
  });
  state.lastEffects = log;
  checkFailure();
}

function changeItem(name, amount) {
  if (!name || !amount) return;
  state.inventory[name] = (state.inventory[name] || 0) + amount;
  if (state.inventory[name] <= 0) delete state.inventory[name];
}

function rememberNavigation(nextTitle) {
  state.history.push({ nodeId: state.nodeId, title: nextTitle });
}

function choose(nextId) {
  if (state.terminal) return;
  const current = node();
  const next = station().nodes[nextId];
  const log = [];

  rememberNavigation(next.title);
  if (current.id === station().root) beginInvestigation(log);

  state.nodeId = nextId;
  applyEffects(next.effects, log);
  queueDialogue(dialogueLines(next));
  render();
}

function setCinematic(stage) {
  stopDialogueTimer();
  state.screen = "cinematic";
  state.cinematicStage = stage;
  render();
}

function chooseIdentity(key) {
  state.identity = key;
  setCinematic("departure");
}

function startRun() {
  state.health = 100;
  state.mental = 100;
  state.hunger = 100;
  state.dayOffset = 0;
  state.inventory = {};
  state.history = [];
  state.visitedStations = [];
  state.terminal = false;
  state.lastEffects = [];
  setCinematic("transit");
}

function arriveAtRandomStation() {
  const remaining = window.GAME_DATA.stations
    .map((_, index) => index)
    .filter((index) => !state.visitedStations.includes(index));

  if (!remaining.length) {
    state.screen = "game";
    showTerminal();
    return;
  }

  const nextIndex = remaining[Math.floor(Math.random() * remaining.length)];
  state.stationIndex = nextIndex;
  state.nodeId = window.GAME_DATA.stations[nextIndex].root;
  state.history = [];
  state.terminal = false;
  state.screen = "game";
  state.lastEffects = ["열차 문이 열린다.", `${station().title}에 도착했다.`];
  state.visitedStations.push(nextIndex);
  closeItemDialog();
  queueDialogue(dialogueLines(node()));
  render();
}

function requestNextStation() {
  state.history = [];
  setCinematic("transit");
}

function returnToStation() {
  state.nodeId = station().root;
  state.history = [];
  state.lastEffects = [];
  queueDialogue(dialogueLines(node(), []));
  render();
}

function showTerminal() {
  state.terminal = true;
  state.nodeId = station().root;
  state.lastEffects = [];
  closeItemDialog();
  queueDialogue(["지하철이 종점에 도착했다."]);
  render();
}

function showBlack(message) {
  stopDialogueTimer();
  state.screen = "black";
  state.blackMessage = message;
  closeItemDialog();
  render();
}

function checkFailure() {
  if (state.health <= 0) showBlack("당신은 쓰러진다.");
  else if (state.mental <= 0) showBlack("당신은 정신을 잃는다.");
  else if (state.hunger <= 0) showBlack("지독한 허기가 당신을 덮친다.");
}

function goBack() {
  const previous = state.history.pop();
  if (!previous) return;
  state.nodeId = previous.nodeId || station().root;
  state.lastEffects = [];
  queueDialogue(dialogueLines(node(), []));
  render();
}

function useVendingMachine() {
  if (state.terminal) return;
  const pool = window.ITEM_DATA?.vendingItems || [];
  if (!pool.length) {
    state.lastEffects = ["자판기에 들어 있는 물건이 없습니다."];
    queueDialogue(state.lastEffects);
    render();
    return;
  }
  const cost = Math.floor(Math.random() * 10) + 1;
  const item = pool[Math.floor(Math.random() * pool.length)];
  changeItem(item.name, 1);
  state.mental = clampStat(state.mental - cost);
  state.lastEffects = ["자판기 사용", `정신력 -${cost}`, `${item.name} +1`];
  queueDialogue(state.lastEffects);
  checkFailure();
  render();
}

function findItem(name) {
  return (window.ITEM_DATA?.items || []).find((item) => item.name === name);
}

function itemIconPath(itemName) {
  return `./assets/items/${itemIcons[itemName] || "consumable.png"}`;
}

function openItemDialog(itemName) {
  const item = findItem(itemName);
  if (!item) return;
  state.selectedItem = itemName;
  els.itemDialogIcon.className = "item-pixel-icon large";
  els.itemDialogIcon.style.setProperty("--item-icon", `url("${itemIconPath(item.name)}")`);
  els.itemDialogTitle.textContent = item.name;
  els.itemDialogDescription.textContent = item.description || "설명이 없습니다.";
  els.itemUseButton.disabled = !(item.useText && item.useText !== "-");
  els.itemDialog.classList.remove("hidden");
}

function closeItemDialog() {
  state.selectedItem = null;
  els.itemDialog.classList.add("hidden");
}

function useItem(itemName) {
  const item = findItem(itemName);
  if (!item || !state.inventory[itemName]) return;
  const log = [`${item.name}${item.particle || "을"} 사용`];
  changeItem(itemName, -1);
  Object.entries(item.effects || {}).forEach(([key, amount]) => applyStatChange(key, amount, log));
  if (item.useText && item.useText !== "-") log.push(item.useText);
  state.lastEffects = log;
  queueDialogue(log);
  checkFailure();
  render();
}

function confirmUseItem() {
  if (!state.selectedItem) return;
  const itemName = state.selectedItem;
  closeItemDialog();
  useItem(itemName);
}

function saveGame() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, selectedItem: null }));
  els.saveButton.textContent = "저장됨";
  window.setTimeout(() => { els.saveButton.textContent = "저장"; }, 900);
}

function loadGame() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;
  try {
    Object.assign(state, JSON.parse(saved));
    state.dayOffset = state.dayOffset || 0;
    state.visitedStations = state.visitedStations || [];
    state.selectedItem = null;
  } catch {
    resetGame();
  }
}

function resetGame() {
  stopDialogueTimer();
  dialogue.lines = [];
  dialogue.pending = null;
  dialogue.choicesReady = false;
  localStorage.removeItem(STORAGE_KEY);
  Object.assign(state, {
    screen: "cinematic",
    cinematicStage: "opening",
    identity: null,
    dayOffset: 0,
    stationIndex: 0,
    nodeId: window.GAME_DATA.stations[0].root,
    health: 100,
    mental: 100,
    hunger: 100,
    inventory: {},
    history: [],
    visitedStations: [],
    terminal: false,
    lastEffects: [],
    selectedItem: null,
    blackMessage: "",
  });
  closeItemDialog();
  render();
}

function cinematicButton(title, description, handler) {
  const button = document.createElement("button");
  button.className = "choice-button compact";
  button.type = "button";
  button.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span>`;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    handler();
  });
  els.cinematicChoices.append(button);
}

function renderCinematic() {
  const stage = state.cinematicStage;
  els.cinematicChoices.innerHTML = "";
  els.cinematicLogo.classList.toggle("hidden", !["opening", "arrival"].includes(stage));
  els.cinematicScreen.className = `cinematic-screen ${stage === "arrival" ? "platform grayscale" : stage === "opening" ? "platform" : "dark"}`;

  const messages = {
    opening: "1950년 1월 1일, 모스크바 역의 개통식이 시작되었다.",
    arrival: "지하철이 들어오는 소리가 들린다.",
    identity: "모스크바 역의 역사적인 첫 지하철 시운전에 동행할 기회를 얻은 나는",
    departure: "열차가 많은 환호 속에서 출발한다.",
    distance: "역간 거리가 이렇게 길었던가?",
    transit: "어두운 차창 너머로 다음 역의 풍경이 보인다.",
  };
  els.cinematicText.textContent = messages[stage] || "";

  if (stage === "arrival") {
    cinematicButton("[지하철을 탄다]", "역사적인 시운전 열차에 오른다.", () => setCinematic("identity"));
  } else if (stage === "identity") {
    cinematicButton("[소련의 인민이다]", "개통식을 자랑스럽게 지켜본다.", () => chooseIdentity("citizen"));
    cinematicButton("[체제 유지에 기여한다]", "행사의 완벽함을 지킨다.", () => chooseIdentity("loyalist"));
    cinematicButton("[완벽한 행사에 숨어든 이물질이다]", "정체를 숨긴 채 열차에 오른다.", () => chooseIdentity("infiltrator"));
  }
}

function advanceCinematic() {
  const transitions = {
    opening: "arrival",
    departure: "distance",
    distance: "transit",
  };
  if (state.cinematicStage === "transit") arriveAtRandomStation();
  else if (transitions[state.cinematicStage]) setCinematic(transitions[state.cinematicStage]);
}

function addChoice(title, description, handler) {
  const button = document.createElement("button");
  button.className = "choice-button";
  button.type = "button";
  button.innerHTML = `<strong>${escapeHtml(title)}</strong><span>${escapeHtml(description)}</span>`;
  button.addEventListener("click", handler);
  els.choices.append(button);
}

function renderChoices(current) {
  els.choices.innerHTML = "";
  if (state.terminal) {
    addChoice("[내린다]", "열차 밖으로 발을 내딛는다.", resetGame);
    addChoice("[내리지 않는다]", "순환을 계속한다.", () => showBlack(""));
    return;
  }

  current.children.forEach((childId) => {
    const child = station().nodes[childId];
    addChoice(child.title, child.prompt || "조사한다.", () => choose(childId));
  });

  if (current.id === station().root) {
    addChoice("[다른 역으로 이동한다.]", "시간을 소모하지 않고 다음 역으로 이동한다.", requestNextStation);
  } else if (!current.children.length) {
    addChoice("[역으로 돌아간다]", "역의 첫 조사 화면으로 돌아간다.", returnToStation);
  }
}

function renderInventory() {
  els.inventoryList.innerHTML = "";
  const entries = Object.entries(state.inventory).filter(([, count]) => count > 0);
  els.inventoryCount.textContent = entries.reduce((sum, [, count]) => sum + count, 0);
  if (!entries.length) {
    const empty = document.createElement("li");
    empty.className = "inventory-empty";
    empty.textContent = "비어 있음";
    els.inventoryList.append(empty);
    return;
  }
  entries.sort((a, b) => a[0].localeCompare(b[0], "ko")).forEach(([name, count]) => {
    const item = findItem(name) || { name, type: "기타" };
    const row = document.createElement("li");
    row.className = "inventory-slot";
    row.innerHTML = `<button type="button" class="inventory-item">
      <span class="item-pixel-icon" style="--item-icon: url('${itemIconPath(item.name)}')" aria-hidden="true"></span>
      <span class="item-name">${escapeHtml(name)}</span><strong class="item-count">${count}</strong>
    </button>`;
    row.querySelector("button").addEventListener("click", () => openItemDialog(name));
    els.inventoryList.append(row);
  });
}

function renderHistory() {
  els.historyList.innerHTML = "";
  state.history.slice(-8).forEach((entry) => {
    const item = document.createElement("li");
    item.textContent = entry.title;
    els.historyList.append(item);
  });
  els.backButton.disabled = state.history.length === 0;
}

function renderEffects() {
  els.effectLog.innerHTML = "";
  state.lastEffects.forEach((effect) => {
    const pill = document.createElement("span");
    pill.className = "effect-pill";
    pill.textContent = effect;
    els.effectLog.append(pill);
  });
}

function renderGame() {
  const current = node();
  els.storyPanel.className = `story-panel ${state.terminal ? "terminal" : stationScenes[state.stationIndex]}`;
  els.stationTitle.textContent = state.terminal ? "종점" : station().title;
  els.currentDate.textContent = formatDate();
  els.routeStatus.textContent = `정차 기록 ${state.visitedStations.length} / ${window.GAME_DATA.stations.length}`;
  els.nodeTitle.textContent = state.terminal ? "종점" : current.title;
  els.depthLabel.textContent = state.terminal ? "도착" : `${current.children.length + (current.id === station().root ? 1 : !current.children.length ? 1 : 0)}개 선택`;
  els.promptText.textContent = state.terminal ? "" : current.prompt;
  els.resultText.textContent = state.terminal ? "지하철이 종점에 도착했다." : current.result || "이곳에는 아직 기록된 결과가 없습니다.";
  els.identityValue.textContent = identities[state.identity] || "미정";
  els.vendingButton.disabled = state.terminal;
  ["health", "mental", "hunger"].forEach((key) => {
    els[`${key}Value`].textContent = state[key];
    els[`${key}Bar`].style.width = `${state[key]}%`;
  });
  renderChoices(current);
  renderInventory();
  renderHistory();
  renderEffects();
  if (dialogue.pending) {
    const lines = dialogue.pending;
    dialogue.pending = null;
    beginDialogue(lines);
  } else if (!dialogue.lines.length) {
    beginDialogue(dialogueLines(current));
  } else {
    els.choices.classList.toggle("hidden", !dialogue.choicesReady);
  }
}

function render() {
  els.cinematicScreen.classList.toggle("hidden", state.screen !== "cinematic");
  els.gameScreen.classList.toggle("hidden", state.screen !== "game");
  els.blackScreen.classList.toggle("hidden", state.screen !== "black");
  if (state.screen === "cinematic") renderCinematic();
  if (state.screen === "game") renderGame();
  if (state.screen === "black") els.blackMessage.textContent = state.blackMessage;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

els.cinematicScreen.addEventListener("click", advanceCinematic);
els.blackScreen.addEventListener("click", resetGame);
els.vendingButton.addEventListener("click", useVendingMachine);
els.dialogueBox.addEventListener("click", advanceDialogue);
els.saveButton.addEventListener("click", saveGame);
els.resetButton.addEventListener("click", resetGame);
els.backButton.addEventListener("click", goBack);
els.itemUseButton.addEventListener("click", confirmUseItem);
els.itemCancelButton.addEventListener("click", closeItemDialog);
els.itemDialog.addEventListener("click", (event) => {
  if (event.target === els.itemDialog) closeItemDialog();
});

loadGame();
render();

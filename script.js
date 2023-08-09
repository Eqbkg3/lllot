Date.prototype.getWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  var today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
  var dayOfYear = ((today - onejan + 86400000)/86400000);
  return Math.ceil(dayOfYear/7)
};

const tg = window.Telegram.WebApp;
let cell = new TonWeb.boc.Cell();
let utils = TonWeb.utils;
let tonweb;

if (!tg.initData){
    getTgPage();
} else {
    let loading = document.getElementsByClassName('ring')[0]
    if (!tg.isExpanded){ loading.style.top = '30%';
    } else { loading.style.top = '50%';    
    }
    loadPage();
}

logoPic = `./files/${tg.colorScheme}_logo.svg`;
menuPic = `./files/${tg.colorScheme}_menu.svg`;
menuClose = `./files/${tg.colorScheme}_Xmark.svg`;

function getTgPage(){
    let teleDiv = document.getElementsByClassName('notTele')[0];
    let mainText = document.createElement('h1');
    mainText.innerText = "Footballlot only in Telegram ";
    teleDiv.appendChild(mainText);

    const tgBotDiv = document.createElement('div');
    const tgBotIcon = document.createElement('img');
    tgBotIcon.setAttribute('src', './files/botIcon.svg');
    tgBotIcon.style.height = '26px';
    const tgBot = document.createElement('a');
    tgBot.innerText = 'Telegram bot';
    tgBot.setAttribute('href', 'https://t.me/footballlotbot');
    tgBotDiv.appendChild(tgBot);
    tgBotDiv.appendChild(tgBotIcon)
    
    const tgChannelDiv = document.createElement('div');
    const tgChannelIcon = document.createElement('img');
    tgChannelIcon.setAttribute('src', './files/telegramLogo.svg');
    tgChannelIcon.style.height = '20px';
    const tgChannel = document.createElement('a');
    tgChannel.innerText = 'Telegram channel';
    tgChannel.setAttribute('href', 'https://t.me/footballlot');
    tgChannelDiv.appendChild(tgChannel);
    tgChannelDiv.appendChild(tgChannelIcon);
    

    teleDiv.appendChild(tgBotDiv);
    teleDiv.appendChild(tgChannelDiv);


    const bottom = document.createElement('span');
    bottom.setAttribute('class', 'bottomWeb');
    let basedTon = document.createElement('p');
    basedTon.innerText = 'Based on TON';
    let bottomImg = document.createElement('img');
    bottomImg.setAttribute('src', './files/TON.svg');
    bottomImg.style.height = '15px';
    bottom.append(basedTon);
    bottom.append(bottomImg);
    teleDiv.append(bottom);


    const load = document.getElementsByClassName('ring')[0];
    load.style.display = 'none';
    teleDiv.style.display = 'flex';
}

async function getTonweb() {
  const endpoint = await TonAccess.getHttpEndpoint();
  const tonweb = new TonWeb(new TonWeb.HttpProvider(endpoint));
  return tonweb;
}

const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl:
    "https://eqbkg3.github.io/lllot/tonconnect-manifest.json",
  buttonRootId: "connect-button",
  uiPreferences: {
    theme: `${tg.colorScheme.toUpperCase()}`,
    colorsSet: {
      [`${tg.colorScheme.toUpperCase()}`]: {
        connectButton: {
          background: tg.themeParams.button_color,
        },
      },
    },
  },
});

async function displayBlock() {
  const container = document.getElementsByClassName("container")[0];
  container.style.display = "block";
  tg.BackButton.hide();
}

async function userName() {
  if (!tonConnectUI.connected) {
    tg.showPopup({ message: "NotConnected" });
  } else {
    const addr = tonConnectUI.wallet.account.address;
    const tonweb = await getTonweb();
    const bla = await tonweb.getBalance(addr);
    tg.showPopup({ message: `Balance: ${utils.fromNano(bla)}` });
  }
}

async function myTickets() {
  if (!tonConnectUI.connected) {
    tg.showPopup({ message: "Please connect wallet to see your tickets" });
  } else {
    tg.showPopup({ message: "In progress..." });
    // const container = document.getElementsByClassName("container")[0];
    // container.style.display = "none";
    // tg.BackButton.show();
    // tg.HapticFeedback.impactOccurred("medium");
    // tg.BackButton.onClick(displayBlock);
  }
}

window.addEventListener("click", function (event) {
  const popupWindow = document.getElementById("menu");
  const toggleButton = document.getElementById("menu-btn");
  const contents = document.getElementsByClassName("content");
  if (!popupWindow.contains(event.target) && event.target !== toggleButton) {
    popupWindow.style.display = "none";
    toggleButton.style.backgroundImage = `url(${menuPic})`;
    contents[0].style.filter = "none";
  }
});

async function getComment() {
  let payl = `${document.getElementById("gameWeek").innerText.split(" ")[2]}|`;
  const text = document
    .getElementById("selectedOptions")
    .querySelectorAll("li");
  for (let i = 0; i < text.length; i++) {
    let first = text[i].innerText
      .split("\n")[0]
      .split(".")[1]
      .split("-")[0]
      .replace(" ", "");
    let second = text[i].innerText
      .split("\n")[0]
      .split(".")[1]
      .split("-")[1]
      .replace(" ", "");
    let choose = text[i].innerText.split("\n")[1];
    if (`${choose} ` === `${first}`) {
      payl = payl + "1";
    } else if (choose === `${second}`) {
      payl = payl + "2";
    } else if (choose === "draw") {
      payl = payl + "x";
    }
  }
  return payl;
}

async function updatePage() {
  const myList = document.getElementById("selectedOptions");
  while (myList.firstChild) {
    myList.removeChild(myList.firstChild);
  }
  document.getElementById("ticket").style.display = "none";
  document.querySelectorAll(".clicked").forEach((button) => {
    button.classList.remove("clicked");
  });
  tg.MainButton.hide();
}

async function transfer() {
  const text = await getComment();
  cell.bits.writeUint(0, 32);
  cell.bits.writeString(text);
  let payload = utils.bytesToBase64(await cell.toBoc());
  if (!tonConnectUI.connected) {
    tg.showPopup({ message: "Please connect wallet to send the transaction!" });
  } else {
    tg.MainButton.hide();
    const transaction = {
      validUntil: Date.now() + 3600,
      messages: [
        {
          address:
            "0:4131288bfa8a970befff83ebbb9ad2c5a49d25c2420da1086b696da228fbf8bb",
          amount: "1000000000",
          payload: payload,
        },
      ],
    };
    try {
      await tonConnectUI.sendTransaction(transaction);
      tg.showPopup({ message: "Transaction was sent successfully ✅" });
      updatePage();
    } catch (e) {
      tg.showPopup({ message: "Unknown error happened" });
      tg.MainButton.show();
    }
  }
}

async function loadPage() {
    const date = new Date();
    const year = date.getFullYear();
  const dataList = await fetch(`./games/Y${year.toString().slice(-2)}W${date.getWeek()}.json`).then((response) =>
    response.json()
  );
  const tonweb = await getTonweb();
  let balance = await tonweb.getBalance(
    "0:4131288bfa8a970befff83ebbb9ad2c5a49d25c2420da1086b696da228fbf8bb"
  );
  balance = utils.fromNano(`${balance}`);
  balance = balance / 2;
  const jackpot = document.getElementById("jackpot");
  const jackPrice = document.createElement("h3");
  let jackimg = document.createElement("img");
  jackimg.setAttribute("src", "./files/jackpot.svg");
  jackimg.style.height = "15px";
  jackPrice.innerText = "Jackpot " + ~~balance;
  jackpot.appendChild(jackPrice);
  jackpot.appendChild(jackimg);

  const week = document.getElementById("gameWeek");
  week.innerText = `Game week ${dataList.gameWeek}`;
  week.append();

  let logo = document.getElementById("logo");
  let logo_img = document.createElement("img");
  logo_img.setAttribute("src", logoPic);
  logo.appendChild(logo_img);

  for (i in dataList.games) {
    let list = document.getElementById("item");
    let caption = document.createElement("li");
    let teams = document.createElement("li");
    let liague = document.createElement("div");
    let time = document.createElement("div");
    let first = document.createElement("button");
    let draw = document.createElement("button");
    let second = document.createElement("button");

    liague.classList.add("liague");
    caption.classList.add("caption");
    time.classList.add("time");
    teams.classList.add("teams");
    teams.setAttribute("data-row", `${i}`);

    first.classList.add("select-button");
    first.setAttribute("onclick", "makeTicket(this)");
    draw.classList.add("select-button");
    draw.setAttribute("onclick", "makeTicket(this)");
    second.classList.add("select-button");
    second.setAttribute("onclick", "makeTicket(this)");

    const unix_time = dataList.games[i]["date"];
    const formatedTime = new Date(unix_time * 1000).toString().split(' ');
    let day = formatedTime[0]
    let dayNum = formatedTime[2]
    let gameTime = formatedTime[4]

    liague.textContent = `${i}. ${dataList.games[i]["liague"]}`;
    time.textContent = `${dayNum} ${day} ${gameTime.slice(0,5)}`;
    first.textContent = dataList.games[i]["team_one"];
    draw.textContent = "draw";
    second.textContent = dataList.games[i]["team_two"];

    caption.appendChild(liague);
    caption.appendChild(time);
    teams.appendChild(first);
    teams.appendChild(draw);
    teams.appendChild(second);
    list.appendChild(caption);
    list.appendChild(teams);
  }
  const tgUser = document.getElementById("tgUser");
  const userName = document.createElement("p");
  if (tg.initDataUnsafe.user.last_name == "none") {
    const full_name = tg.initDataUnsafe.user.last_name;
    userName.textContent = full_name;
    tgUser.appendChild(userName);
  } else {
    const full_name =
      tg.initDataUnsafe.user.first_name +
      " " +
      tg.initDataUnsafe.user.last_name;
    userName.textContent = full_name;
    tgUser.appendChild(userName);
  }
  const menu_btn = document.getElementById("menu-btn");
  menu_btn.style.backgroundImage = `url("${menuPic}")`;
    const loading = document.getElementsByClassName("ring")[0]
    loading.style.display = 'none';
    const container = document.getElementsByClassName("container")[0]
    container.style.display = 'block';
    loading.append();
    container.append();
}

function toggleMenu() {
  let menu = document.getElementById("menu");
  let menu_btn = document.getElementById("menu-btn");
  let contents = document.getElementsByClassName("content");

  if (menu.style.display === "none") {
    contents[0].style.filter = "blur(3px)";
    menu.style.display = "flex";
    menu_btn.style.backgroundImage = `url(${menuClose})`;
  } else {
    menu.style.display = "none";
    menu_btn.style.backgroundImage = `url(${menuPic})`;
    contents[0].style.filter = "none";
  }
}

function openLink() {
  tg.openLink("https://telegra.ph/Term-of-Use-07-27", {
    try_instant_view: true,
  });
}

function makeTicket(button) {
  const selectedList = document.getElementById("selectedOptions");
  tg.HapticFeedback.impactOccurred("medium");
  let ticketText = `${button.parentElement.dataset.row}. `;
  document
    .getElementById("item")
    .querySelectorAll(`li[data-row="${button.parentElement.dataset.row}"]`)[0]
    .querySelectorAll("button")
    .forEach((el) => {
      if (el.innerText === "draw") {
        ticketText = ticketText + " - ";
      } else {
        ticketText = ticketText + `${el.innerText}`;
      }

      if (el.innerText === button.innerText && el.classList.length === 2) {
        button.classList.remove("clicked");
      } else if (
        el.innerText === button.innerText &&
        el.classList.length === 1
      ) {
        button.classList.add("clicked");
      } else if (el.classList.length === 2) {
        el.classList.remove("clicked");
      }
    });

  const selectedOptionsInRow = selectedList.querySelectorAll(
    `li[game-row="${button.parentElement.dataset.row}"]`
  );
  selectedOptionsInRow.forEach((option) => option.remove());

  const game = document.createElement("li");
  const match = document.createElement("div");
  const choose = document.createElement("div");
  game.setAttribute("game-row", `${button.parentElement.dataset.row}`);
  choose.classList.add("choose");
  match.innerText = ticketText;
  choose.innerText = button.innerText;
  game.appendChild(match);
  game.appendChild(choose);

  const clicked = document.getElementsByClassName("clicked").length;
  const ticket = document.getElementById("ticket");

  if (clicked === 0) {
    tg.disableClosingConfirmation();
    ticket.style.display = "none";
  } else if (clicked === 1) {
    tg.enableClosingConfirmation();
    ticket.style.display = "block";
  } else if (clicked === 11) {
    tg.MainButton.setText("Pay 1 TON");
    tg.MainButton.onClick(transfer);
    tg.MainButton.show();
  } else {
    tg.MainButton.hide();
  }

  selectedList.appendChild(game);
  const sortedOptions = Array.from(selectedList.querySelectorAll("li")).sort(
    (a, b) => {
      return a.getAttribute("game-row") - b.getAttribute("game-row");
    }
  );

  selectedList.innerHTML = "";
  sortedOptions.forEach((option) => selectedList.appendChild(option));
}

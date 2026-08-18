(function () {
  "use strict";

  var ENDPOINT = "/player-info";
  var STORE_KEY = "ff_api_base";
  var PERMANENT_API = "https://shivraj-info-freefireviamax.vercel.app";
  
  // Set permanent base API as default fallback
  var currentApi = localStorage.getItem(STORE_KEY) || PERMANENT_API;
  var lastResult = null;
  var rawVisible = false;

  var $ = function (id) { return document.getElementById(id); };

  var loading = $("loading");
  var errorBox = $("errorBox");
  var resultArea = $("resultArea");
  var resultActions = $("resultActions");
  var rawJson = $("rawJson");
  var apiDisplay = $("apiDisplay");
  var submitBtn = $("submitBtn");

  function updateApiDisplay() {
    apiDisplay.textContent = currentApi.replace(/\/+$/, "") + ENDPOINT + "?uid=…";
  }

  updateApiDisplay();

  function fmt(n) {
    if (n === undefined || n === null || n === "") return "—";
    var num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString("en-US");
  }

  function timeAgo(sec) {
    var t = Number(sec);
    if (!t) return "—";
    var diff = Math.max(0, Math.floor(Date.now() / 1000) - t);
    var d = Math.floor(diff / 86400);
    var h = Math.floor((diff % 86400) / 3600);
    var m = Math.floor((diff % 3600) / 60);
    if (d > 365) return new Date(t * 1000).toLocaleDateString();
    if (d > 0) return d + "d ago";
    if (h > 0) return h + "h ago";
    if (m > 0) return m + "m ago";
    return "just now";
  }

  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function row(k, v, accent) {
    var div = el("div", "kv");
    div.appendChild(el("span", "k", k));
    div.appendChild(el("span", "v" + (accent ? " accent" : ""), v));
    return div;
  }

  function card(title, icon) {
    var c = el("section", "pcard");
    var head = el("div", "pcard-head");
    head.appendChild(el("span", "pcard-icon", icon));
    head.appendChild(el("h4", null, title));
    c.appendChild(head);
    return c;
  }

  function setError(msg, mode) {
    errorBox.textContent = msg;
    errorBox.className = "error" + (mode === "success" ? " success" : "");
    errorBox.classList.remove("hidden");
  }

  function resetState() {
    errorBox.classList.add("hidden");
    resultArea.innerHTML = "";
    resultActions.classList.add("hidden");
    rawJson.classList.add("hidden");
    rawVisible = false;
    $("expandJson").textContent = "Show raw JSON";
  }

  function renderPlayer(data) {
    lastResult = data;
    resultArea.innerHTML = "";
    rawJson.textContent = JSON.stringify(data, null, 2);

    var basic = data.basicInfo || {};
    var profile = data.profileInfo || {};
    var clan = data.clanBasicInfo || {};
    var captain = data.captainBasicInfo || {};
    var pet = data.petInfo || {};
    var social = data.socialInfo || {};
    var credit = data.creditScoreInfo || {};
    var dcr = data.diamondCostRes || {};

    var wrap = el("div", "player");

    var hero = el("div", "player-hero");
    var avatar = el("div", "avatar", (basic.nickname || "?").trim().charAt(0).toUpperCase() || "?");
    hero.appendChild(avatar);

    var heroText = el("div", "player-hero-text");
    heroText.appendChild(el("h3", null, basic.nickname || "Unknown Player"));
    heroText.appendChild(el("p", "uid-line", "UID " + fmt(basic.accountId) + " • " + (basic.region || "—") + (basic.releaseVersion ? " • " + basic.releaseVersion : "")));

    var badges = el("div", "badges");
    if (basic.level !== undefined) badges.appendChild(el("span", "badge", "LV " + basic.level));
    if (basic.rank !== undefined) badges.appendChild(el("span", "badge", "BR #" + fmt(basic.rank)));
    if (basic.csRank !== undefined) badges.appendChild(el("span", "badge", "CS #" + fmt(basic.csRank)));
    badges.appendChild(el("span", "badge soft", fmt(basic.liked) + " Likes"));
    heroText.appendChild(badges);
    hero.appendChild(heroText);
    wrap.appendChild(hero);

    var quickStats = el("div", "quick-stats");
    quickStats.appendChild(row("BR Points", fmt(basic.rankingPoints), true));
    quickStats.appendChild(row("CS Points", fmt(basic.csRankingPoints), true));
    quickStats.appendChild(row("Credit Score", fmt(credit.creditScore), true));
    quickStats.appendChild(row("Diamond Cost", fmt(dcr.diamondCost), true));
    wrap.appendChild(quickStats);

    var grid = el("div", "pgrid");

    var cBasic = card("Player", "👤");
    cBasic.appendChild(row("Level", fmt(basic.level), true));
    cBasic.appendChild(row("EXP", fmt(basic.exp)));
    cBasic.appendChild(row("BR Rank", "#" + fmt(basic.rank), true));
    cBasic.appendChild(row("CS Rank", "#" + fmt(basic.csRank)));
    cBasic.appendChild(row("Created", timeAgo(basic.createAt)));
    cBasic.appendChild(row("Last Login", timeAgo(basic.lastLoginAt)));
    grid.appendChild(cBasic);

    var cProfile = card("Profile", "🎯");
    cProfile.appendChild(row("Avatar ID", fmt(profile.avatarId)));
    cProfile.appendChild(row("Skin Color", fmt(profile.skinColor)));
    cProfile.appendChild(row("Clothes", (profile.clothes || []).map(fmt).join(", ") || "—"));
    cProfile.appendChild(row("Awakened", profile.isSelectedAwaken ? "Yes" : "No"));
    grid.appendChild(cProfile);

    var cClan = card("Clan", "🏆");
    cClan.appendChild(row("Name", clan.clanName || "No clan", true));
    cClan.appendChild(row("Level", fmt(clan.clanLevel)));
    cClan.appendChild(row("Members", clan.memberNum !== undefined ? fmt(clan.memberNum) + " / " + fmt(clan.capacity) : "—"));
    cClan.appendChild(row("Captain", captain.nickname || "—"));
    grid.appendChild(cClan);

    var cPet = card("Pet", "🐾");
    cPet.appendChild(row("Name", pet.name || "None shown", true));
    cPet.appendChild(row("Level", fmt(pet.level)));
    cPet.appendChild(row("EXP", fmt(pet.exp)));
    cPet.appendChild(row("Skin ID", fmt(pet.skinId)));
    grid.appendChild(cPet);

    var cSocial = card("Social", "💬");
    cSocial.appendChild(row("Signature", social.signature || "—"));
    cSocial.appendChild(row("Language", String(social.language || "—").replace("Language_", "")));
    cSocial.appendChild(row("Rank Show", String(social.rankShow || "—").replace("RankShow_", "")));
    grid.appendChild(cSocial);

    var cAccount = card("Account", "🛡️");
    cAccount.appendChild(row("Likes", fmt(basic.liked), true));
    cAccount.appendChild(row("Credit Score", fmt(credit.creditScore)));
    cAccount.appendChild(row("Reward State", String(credit.rewardState || "—").replace("REWARD_STATE_", "")));
    cAccount.appendChild(row("Diamond Cost", fmt(dcr.diamondCost), true));
    grid.appendChild(cAccount);

    wrap.appendChild(grid);
    resultArea.appendChild(wrap);
    resultActions.classList.remove("hidden");
  }

  function lookup(uid, region) {
    loading.classList.remove("hidden");
    submitBtn.disabled = true;
    resetState();

    var base = currentApi.replace(/\/+$/, "");
    var url = base + ENDPOINT + "?uid=" + encodeURIComponent(uid);
    if (region) url += "&region=" + encodeURIComponent(region);

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("API returned HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data.error) throw new Error(data.error);
        renderPlayer(data);
      })
      .catch(function (err) {
        setError("Could not fetch player info. " + err.message + ". Check that your API base URL is correct and that the /player-info route is live.");
      })
      .finally(function () {
        loading.classList.add("hidden");
        submitBtn.disabled = false;
      });
  }

  $("lookupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var uid = $("uidInput").value.trim();
    if (!/^\d+$/.test(uid)) {
      setError("UID must contain digits only.");
      return;
    }
    lookup(uid, $("regionSelect").value);
  });

  $("copyJson").addEventListener("click", function () {
    if (!lastResult) return;
    navigator.clipboard.writeText(JSON.stringify(lastResult, null, 2)).then(function () {
      $("copyJson").textContent = "Copied";
      setTimeout(function () { $("copyJson").textContent = "Copy JSON"; }, 1400);
    });
  });

  $("dlJson").addEventListener("click", function () {
    if (!lastResult) return;
    var blob = new Blob([JSON.stringify(lastResult, null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "player-info-" + (lastResult.basicInfo ? lastResult.basicInfo.accountId : "export") + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  });

  $("expandJson").addEventListener("click", function () {
    rawVisible = !rawVisible;
    rawJson.classList.toggle("hidden", !rawVisible);
    $("expandJson").textContent = rawVisible ? "Hide raw JSON" : "Show raw JSON";
  });

  $("apiBaseSave").addEventListener("click", function () {
    var v = $("apiBaseInput").value.trim().replace(/\/+$/, "");
    currentApi = v || PERMANENT_API;
    localStorage.setItem(STORE_KEY, currentApi);
    updateApiDisplay();
    $("apiBaseInput").value = "";
    setError("API base URL saved: " + currentApi, "success");
    setTimeout(function () { errorBox.classList.add("hidden"); }, 2200);
  });
})();

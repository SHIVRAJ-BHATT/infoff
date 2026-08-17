/* ============================================================
   NAJMI INFO APIS — front-end logic (no dependencies)
   Talks to the NAJMI FF EXPERIMENT Free Fire info API.
   ============================================================ */

(function () {
  "use strict";

  var ENDPOINT = "/player-info";
  var STORE_KEY = "ff_api_base";

  var DEFAULT_API = "https://your-api.vercel.app";
  var currentApi = localStorage.getItem(STORE_KEY) || DEFAULT_API;
  var lastResult = null;

  var $ = function (id) { return document.getElementById(id); };

  var loading = $("loading");
  var errorBox = $("errorBox");
  var resultArea = $("resultArea");
  var resultActions = $("resultActions");
  var rawJson = $("rawJson");
  var apiDisplay = $("apiDisplay");
  var rawVisible = false;

  apiDisplay.textContent = (currentApi === DEFAULT_API ? DEFAULT_API : currentApi) + ENDPOINT + "?uid=…";

  /* ---------- helpers ---------- */

  function fmt(n) {
    if (n === undefined || n === null) return "—";
    var num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString("en-US");
  }

  function timeAgo(sec) {
    var t = Number(sec);
    if (!t) return "—";
    var diff = Math.max(0, Math.floor(Date.now() / 1000) - t);
    var d = Math.floor(diff / 86400), h = Math.floor((diff % 86400) / 3600);
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

  /* Build one name/value row safely (textContent = no HTML injection). */
  function row(k, v, gold) {
    var div = el("div", "kv");
    div.appendChild(el("span", "k", k));
    var vn = el("span", "v" + (gold ? " gold" : ""), v);
    div.appendChild(vn);
    return div;
  }

  function card(title) {
    var c = el("div", "pcard");
    c.appendChild(el("h4", null, title));
    return c;
  }

  /* ---------- rendering ---------- */

  function renderPlayer(data) {
    lastResult = data;
    resultArea.innerHTML = "";
    rawJson.textContent = JSON.stringify(data, null, 2);

    var basic = (data.basicInfo || {});
    var profile = (data.profileInfo || {});
    var clan = (data.clanBasicInfo || {});
    var captain = (data.captainBasicInfo || {});
    var pet = (data.petInfo || {});
    var social = (data.socialInfo || {});
    var credit = (data.creditScoreInfo || {});
    var dcr = (data.diamondCostRes || {});

    var wrap = el("div", "player");

    /* --- header --- */
    var head = el("div", "player-head");
    var av = el("div", "avatar");
    var initial = (basic.nickname || "?").trim().charAt(0).toUpperCase() || "?";
    av.textContent = initial;
    head.appendChild(av);

    var htxt = el("div");
    htxt.appendChild(el("h3", null, basic.nickname || "Unknown Player"));
    var uidLine = el("div", "uid-line", "UID " + fmt(basic.accountId) + " · " + (basic.region || "—"));
    if (basic.releaseVersion) uidLine.textContent += " · " + basic.releaseVersion;
    htxt.appendChild(uidLine);

    var badges = el("div", "badges");
    if (basic.level !== undefined) badges.appendChild(el("span", "badge", "LV " + basic.level));
    if (basic.rank !== undefined) badges.appendChild(el("span", "badge", "BR #" + fmt(basic.rank)));
    if (basic.csRank !== undefined) badges.appendChild(el("span", "badge", "CS #" + fmt(basic.csRank)));
    badges.appendChild(el("span", "badge dark", fmt(basic.liked) + " ❤"));
    htxt.appendChild(badges);
    head.appendChild(htxt);
    wrap.appendChild(head);

    /* --- stat cards --- */
    var grid = el("div", "pgrid");

    var cBasic = card("Player");
    cBasic.appendChild(row("Level", fmt(basic.level), true));
    cBasic.appendChild(row("EXP", fmt(basic.exp)));
    cBasic.appendChild(row("BR Rank", "#" + fmt(basic.rank), true));
    cBasic.appendChild(row("BR Points", fmt(basic.rankingPoints)));
    cBasic.appendChild(row("CS Rank", "#" + fmt(basic.csRank)));
    cBasic.appendChild(row("CS Points", fmt(basic.csRankingPoints)));
    cBasic.appendChild(row("Max BR Rank", "#" + fmt(basic.maxRank)));
    cBasic.appendChild(row("Created", timeAgo(basic.createAt)));
    cBasic.appendChild(row("Last Login", timeAgo(basic.lastLoginAt)));
    grid.appendChild(cBasic);

    var cProfile = card("Profile");
    cProfile.appendChild(row("Avatar ID", fmt(profile.avatarId)));
    cProfile.appendChild(row("Skin Color", fmt(profile.skinColor)));
    cProfile.appendChild(row("Clothes", (profile.clothes || []).map(fmt).join(", ")));
    cProfile.appendChild(row("Awakened", profile.isSelectedAwaken ? "Yes" : "No"));
    grid.appendChild(cProfile);

    var cClan = card("Clan");
    if (clan.clanName) {
      cClan.appendChild(row("Name", clan.clanName, true));
      cClan.appendChild(row("Level", fmt(clan.clanLevel)));
      cClan.appendChild(row("Members", fmt(clan.memberNum) + " / " + fmt(clan.capacity)));
      cClan.appendChild(row("Clan ID", fmt(clan.clanId)));
    } else {
      cClan.appendChild(row("Name", "No clan", true));
    }
    if (captain.nickname) {
      cClan.appendChild(row("Captain", captain.nickname));
      cClan.appendChild(row("Captain Lv", fmt(captain.level)));
    }
    grid.appendChild(cClan);

    var cPet = card("Pet");
    if (pet.name && pet.name !== basic.nickname) {
      cPet.appendChild(row("Name", pet.name, true));
      cPet.appendChild(row("Level", fmt(pet.level)));
      cPet.appendChild(row("EXP", fmt(pet.exp)));
      cPet.appendChild(row("Skin ID", fmt(pet.skinId)));
    } else {
      cPet.appendChild(row("Pet", "None shown"));
    }
    grid.appendChild(cPet);

    var cSocial = card("Social");
    cSocial.appendChild(row("Signature", social.signature || "—"));
    cSocial.appendChild(row("Language", String(social.language || "—").replace("Language_", "")));
    cSocial.appendChild(row("Rank Show", String(social.rankShow || "—").replace("RankShow_", "")));
    grid.appendChild(cSocial);

    var cCredit = card("Account");
    cCredit.appendChild(row("Credit Score", fmt(credit.creditScore), true));
    cCredit.appendChild(row("Reward State", String(credit.rewardState || "—").replace("REWARD_STATE_", "")));
    cCredit.appendChild(row("Diamond Cost", fmt(dcr.diamondCost), true));
    grid.appendChild(cCredit);

    wrap.appendChild(grid);
    resultArea.appendChild(wrap);

    resultActions.classList.remove("hidden");
    if (rawVisible) rawJson.classList.remove("hidden");
  }

  /* ---------- data fetch ---------- */

  function setError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
  }

  function lookup(uid, region) {
    loading.classList.remove("hidden");
    errorBox.classList.add("hidden");
    resultArea.innerHTML = "";
    resultActions.classList.add("hidden");
    rawJson.classList.add("hidden");

    var base = currentApi.replace(/\/+$/, "");
    var url = base + ENDPOINT + "?uid=" + encodeURIComponent(uid);
    if (region) url += "&region=" + encodeURIComponent(region);

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("API returned HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data.error) throw new Error(data.error + " — UID not found in any region.");
        renderPlayer(data);
      })
      .catch(function (err) {
        setError("Could not fetch player info.\n" + err.message + "\n\nIs the API deployed? Set the correct API base URL below (⚙ Settings).");
      })
      .finally(function () {
        loading.classList.add("hidden");
      });
  }

  /* ---------- demo data (sample response from the project README) ---------- */

  var DEMO = {
    "basicInfo": {
      "accountId": "338277714", "accountType": 1, "nickname": "Duy Vinh",
      "region": "VN", "level": 69, "exp": 2696267, "bannerId": 901000089,
      "headPic": 902000094, "rank": 323, "rankingPoints": 4703, "badgeCnt": 41,
      "badgeId": 1001000085, "seasonId": 45, "liked": 43010,
      "lastLoginAt": "1749865935", "csRank": 317, "csRankingPoints": 69,
      "weaponSkinShows": [907101304], "pinId": 910002803, "maxRank": 323,
      "csMaxRank": 317, "accountPrefers": { "brPregameShowChoices": [1] },
      "createAt": "1533628526", "title": 904090026,
      "externalIconInfo": { "status": "ExternalIconStatus_NOT_IN_USE", "showType": "ExternalIconShowType_FRIEND" },
      "releaseVersion": "OB49", "showBrRank": true, "showCsRank": true,
      "socialHighLightsWithBasicInfo": {}
    },
    "profileInfo": {
      "avatarId": 102000004, "skinColor": 33,
      "clothes": [205049027, 214045000, 203000485, 204000267, 211000240],
      "equipedSkills": [16, 5801, 8, 1, 16, 304, 8, 2, 16, 2506, 8, 3, 16, 5201],
      "isSelected": true, "isSelectedAwaken": true
    },
    "clanBasicInfo": {
      "clanId": "3067571084", "clanName": "Rắn Độc fi5", "captainId": "1389031980",
      "clanLevel": 3, "capacity": 55, "memberNum": 23
    },
    "captainBasicInfo": {
      "accountId": "1389031980", "accountType": 1, "nickname": "Exanimateᴗ",
      "region": "VN", "level": 81, "exp": 7457894, "bannerId": 901029016,
      "headPic": 902000022, "rank": 318, "rankingPoints": 3053, "badgeCnt": 62,
      "badgeId": 1001000085, "seasonId": 45, "liked": 29306,
      "lastLoginAt": "1749843937", "csRank": 322, "csRankingPoints": 114,
      "weaponSkinShows": [907192607, 912034003], "pinId": 910002901,
      "maxRank": 318, "csMaxRank": 322, "accountPrefers": {},
      "createAt": "1567648917", "title": 904590058,
      "externalIconInfo": { "status": "ExternalIconStatus_NOT_IN_USE", "showType": "ExternalIconShowType_FRIEND" },
      "releaseVersion": "OB49", "showBrRank": true, "showCsRank": true,
      "socialHighLightsWithBasicInfo": {}
    },
    "petInfo": {
      "id": 1300000041, "name": "Duy　Vinh", "level": 7, "exp": 6015,
      "isSelected": true, "skinId": 1310000044, "selectedSkillId": 1315000012
    },
    "socialInfo": {
      "accountId": "338277714", "language": "Language_VIETNAMESE",
      "signature": "Mùa hè đã đến k12 có míc", "rankShow": "RankShow_BR"
    },
    "diamondCostRes": { "diamondCost": 390 },
    "creditScoreInfo": { "creditScore": 100, "rewardState": "REWARD_STATE_UNCLAIMED", "periodicSummaryEndTime": "1749773520" }
  };

  /* ---------- events ---------- */

  $("lookupForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var uid = $("uidInput").value.trim();
    if (!/^\d+$/.test(uid)) {
      setError("UID must be a numeric ID (digits only).");
      return;
    }
    lookup(uid, $("regionSelect").value);
  });

  $("demoBtn").addEventListener("click", function () {
    loading.classList.add("hidden");
    errorBox.classList.add("hidden");
    $("uidInput").value = "338277714";
    renderPlayer(DEMO);
    resultArea.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  $("copyJson").addEventListener("click", function () {
    if (!lastResult) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(JSON.stringify(lastResult, null, 2)).then(function () {
        $("copyJson").textContent = "✅ Copied!";
        setTimeout(function () { $("copyJson").textContent = "📋 Copy JSON"; }, 1500);
      });
    } else {
      var ta = document.createElement("textarea");
      ta.value = JSON.stringify(lastResult, null, 2);
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (_) { /* noop */ }
      document.body.removeChild(ta);
    }
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
    $("expandJson").textContent = rawVisible ? "▴ Hide raw JSON" : "▾ Show raw JSON";
  });

  $("apiBaseSave").addEventListener("click", function () {
    var v = $("apiBaseInput").value.trim().replace(/\/+$/, "") || DEFAULT_API;
    currentApi = v;
    localStorage.setItem(STORE_KEY, v);
    apiDisplay.textContent = v + ENDPOINT + "?uid=…";
    $("apiBaseInput").value = "";
    errorBox.classList.add("hidden");
    setError("API base URL saved: " + v);
    setTimeout(function () { errorBox.classList.add("hidden"); }, 2600);
  });
})();

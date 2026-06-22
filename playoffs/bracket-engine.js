// HAYSA Bracket Engine — Fixed Connectors, Score Validation, and Color Version

window.HAYSA_BRACKET_ENGINE = (function () {

  function isHaysaTeam(name) {
    if (!name) return false;
    const n = name.toUpperCase();
    return n.includes("HOLA") || n.includes("HOLBROOK") || n.includes("HAYSA");
  }

  function formatDateTime(dateStr, timeStr) {
    if (!dateStr || dateStr === "-" || dateStr === "") return "";
    try {
      const d = new Date(dateStr);
      let datePart = d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric"
      });

      let timePart = "";
      if (timeStr && timeStr !== "-" && timeStr !== "") {
        const t = new Date(timeStr);
        timePart = t.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit"
        });
      }

      return timePart ? `${datePart} @ ${timePart}` : datePart;
    } catch (e) {
      return "";
    }
  }

  function createGameCard(game, roundLabel, theme, isFinal) {
    const wrap = document.createElement("div");
    wrap.className = `bracket-connector ${roundLabel.toLowerCase()}`;

    const card = document.createElement("div");
    card.setAttribute("data-match", game.Match || "");
    card.style.borderRadius = "10px";
    card.style.border = `1px solid ${theme.borderSoft}`;
    card.style.background = theme.cardBg;
    card.style.padding = "6px 8px";
    card.style.fontSize = "0.8rem";
    card.style.position = "relative";

    if (isFinal) {
      card.style.borderWidth = "2px";
      card.style.boxShadow = "0 0 12px rgba(244,122,32,0.4)";
    }

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.marginBottom = "4px";

    const round = document.createElement("span");
    round.textContent = roundLabel;
    round.style.fontWeight = "600";
    round.style.color = theme.gold; // 🔧 changed from theme.royal

    const meta = document.createElement("div");
    meta.style.display = "flex";
    meta.style.flexDirection = "column";
    meta.style.alignItems = "flex-end";

    const dt = formatDateTime(game.Date, game.Time);
    if (dt) {
      const dtSpan = document.createElement("span");
      dtSpan.textContent = dt;
      dtSpan.style.fontSize = "0.7rem";
      dtSpan.style.color = "#9CA3AF";
      meta.appendChild(dtSpan);
    }

    if (game.Field || game.Complex) {
      const loc = document.createElement("span");
      loc.textContent = `${game.Complex || ""} ${game.Field || ""}`.trim();
      loc.style.fontSize = "0.7rem";
      loc.style.color = "#9CA3AF";
      meta.appendChild(loc);
    }

    header.appendChild(round);
    header.appendChild(meta);
    card.appendChild(header);

    function addTeamRow(name, score) {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.margin = "2px 0";

      const isWinner =
        (score !== "" && score !== undefined && score !== null) &&
        (
          (Number(score) > Number(game.HomeScore) && name === game.AwayTeam) ||
          (Number(score) > Number(game.AwayScore) && name === game.HomeTeam)
        );

      const nameSpan = document.createElement("span");
      nameSpan.textContent = name || "";
      nameSpan.style.fontWeight = isHaysaTeam(name) ? "700" : "500";
      nameSpan.style.color = theme.text;

      if (isHaysaTeam(name)) {
        const badge = document.createElement("span");
        badge.textContent = "H";
        badge.style.marginLeft = "6px";
        badge.style.fontSize = "0.65rem";
        badge.style.fontWeight = "700";
        badge.style.color = theme.orange;
        badge.style.border = `1px solid ${theme.orange}`;
        badge.style.padding = "1px 4px";
        badge.style.borderRadius = "4px";
        badge.style.opacity = "0.9";
        nameSpan.appendChild(badge);
      }

      const scoreSpan = document.createElement("span");
      scoreSpan.textContent = score !== undefined && score !== "" && score !== null ? score : "";
      scoreSpan.style.fontWeight = "600";
      scoreSpan.style.color = theme.gold;

      if (isWinner) {
        row.style.borderLeft = `4px solid ${theme.gold}`;
        row.style.paddingLeft = "6px";
        row.style.background = "rgba(246,169,74,0.08)";
        row.style.borderRadius = "4px";

        if (isFinal) {
          row.style.boxShadow = "0 0 12px rgba(246,169,74,0.6)";
        }
      }

      row.appendChild(nameSpan);
      row.appendChild(scoreSpan);
      card.appendChild(row);
    }

    addTeamRow(game.HomeTeam, game.HomeScore);
    addTeamRow(game.AwayTeam, game.AwayScore);

    wrap.appendChild(card);
    return wrap;
  }

  function addRoundLabel(col, text, theme) {
    const lbl = document.createElement("div");
    lbl.textContent = text;
    lbl.style.textAlign = "center";
    lbl.style.fontWeight = "700";
    lbl.style.marginBottom = "6px";
    lbl.style.color = theme.gold;
    col.prepend(lbl);
  }

  function centerColumn(col) {
    col.style.display = "flex";
    col.style.flexDirection = "column";
    col.style.justifyContent = "center";
    col.style.gap = "16px";
  }

  function renderBracket(container, data, options) {
    const theme = options.theme || {};

    theme.text = theme.text || "#F9FAFB";
    theme.borderSoft = theme.borderSoft || "#1F2937";
    theme.cardBg = theme.cardBg || "#111827";
    theme.royal = theme.royal || "#1B3A8A";
    theme.orange = theme.orange || "#F47A20";
    theme.gold = theme.gold || "#F6A94A";

    container.innerHTML = "";
    container.style.position = "relative";

    const wrapper = document.createElement("div");
    wrapper.style.display = "grid";
    wrapper.style.gridTemplateColumns = "1fr 0.8fr 1fr";
    wrapper.style.gap = "20px";
    wrapper.style.alignItems = "stretch";
    wrapper.style.padding = "10px";

    const qfGames = data.QF || [];
    const sfGames = data.SF || [];
    const finalGames = data.FINAL || [];

    const qfByNext = {};
    qfGames.forEach(g => {
      if (!g.NextMatch) return;
      const key = String(g.NextMatch).trim().toUpperCase(); // 🔧 normalize
      if (!qfByNext[key]) qfByNext[key] = [];
      qfByNext[key].push(g);
    });

    const sfByNext = {};
    sfGames.forEach(g => {
      if (!g.NextMatch) return;
      const key = String(g.NextMatch).trim().toUpperCase(); // 🔧 normalize
      if (!sfByNext[key]) sfByNext[key] = [];
      sfByNext[key].push(g);
    });

    const orderedSF = Object.keys(sfByNext)
      .sort()
      .flatMap(key => sfByNext[key]);

    const effectiveSF = orderedSF.length ? orderedSF : sfGames.slice();

    let orderedQF = [];
    if (orderedSF.length) {
      orderedQF = orderedSF.flatMap(sf => qfByNext[String(sf.Match).trim().toUpperCase()] || []);
    }
    if (!orderedQF.length) {
      orderedQF = qfGames.slice();
    }

    const qfCol = document.createElement("div");
    const sfCol = document.createElement("div");
    const finalCol = document.createElement("div");

    centerColumn(qfCol);
    centerColumn(sfCol);
    centerColumn(finalCol);

    addRoundLabel(qfCol, "Quarterfinals", theme);
    addRoundLabel(sfCol, "Semifinals", theme);
    addRoundLabel(finalCol, "Final", theme);

    orderedQF.forEach(g => qfCol.appendChild(createGameCard(g, "QF", theme, false)));
    effectiveSF.forEach(g => sfCol.appendChild(createGameCard(g, "SF", theme, false)));
    finalGames.forEach(g => finalCol.appendChild(createGameCard(g, "FINAL", theme, true)));

    wrapper.appendChild(qfCol);
    wrapper.appendChild(sfCol);
    wrapper.appendChild(finalCol);

    container.append

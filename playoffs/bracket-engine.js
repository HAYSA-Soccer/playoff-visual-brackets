// HAYSA Bracket Engine — Improved QF/SF/Final Grouping + H Indicator Fix

window.HAYSA_BRACKET_ENGINE = (function () {

  // Identify HAYSA/HOLBROOK/AVON/HOLA teams
  function isHaysaTeam(name) {
    if (!name) return false;
    const n = name.toUpperCase();

    const indicators = [
      "HOLA",
      "HOLBROOK",
      "AVON",
      "HAYSA",
      "HOLBROOK AVON",
      "(H)"
    ];

    return indicators.some(key => n.includes(key));
  }

  // Format date/time safely
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

  // Create a single game card
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

    // Header
    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.marginBottom = "4px";

    const round = document.createElement("span");
    round.textContent = roundLabel;
    round.style.fontWeight = "600";
    round.style.color = theme.royal;

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

    // Team rows
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

  // Add round labels
  function addRoundLabel(col, text, theme) {
    const lbl = document.createElement("div");
    lbl.textContent = text;
    lbl.style.textAlign = "center";
    lbl.style.fontWeight = "700";
    lbl.style.marginBottom = "6px";
    lbl.style.color = theme.gold;
    col.prepend(lbl);
  }

  // Main render function
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
      if (!qfByNext[g.NextMatch]) qfByNext[g.NextMatch] = [];
      qfByNext[g.NextMatch].push(g);
    });

    const sfByNext = {};
    sfGames.forEach(g => {
      if (!g.NextMatch) return;
      if (!sfByNext[g.NextMatch]) sfByNext[g.NextMatch] = [];
      sfByNext[g.NextMatch].push(g);
    });

    // ⭐ TRUE BRACKET GROUPING ⭐

    // 1. Identify the single Final
    const final = finalGames[0];
    const finalMatch = final ? final.Match : null;

    // 2. Find all SFs feeding the Final
    let effectiveSF = [];
    if (finalMatch) {
      effectiveSF = sfByNext[finalMatch] || [];
    }

    // If no SFs exist, use raw SF list (2‑team division)
    if (!effectiveSF.length) {
      effectiveSF = sfGames.slice();
    }

    // 3. For each SF, find QFs feeding it
    let orderedQF = [];
    effectiveSF.forEach(sf => {
      const qfs = qfByNext[sf.Match] || [];
      orderedQF.push(...qfs);
    });

    // If no QFs exist, use raw QF list (4‑team division)
    if (!orderedQF.length) {
      orderedQF = qfGames.slice();
    }

    // Build columns
    const qfCol = document.createElement("div");
    const sfCol = document.createElement("div");
    const finalCol = document.createElement("div");

    qfCol.style.display = "flex";
    qfCol.style.flexDirection = "column";

    sfCol.style.display = "flex";
    sfCol.style.flexDirection = "column";

    finalCol.style.display = "flex";
    finalCol.style.flexDirection = "column";
    finalCol.style.justifyContent = "center";
    finalCol.style.alignItems = "center";

    // Add labels
    if (orderedQF.length) addRoundLabel(qfCol, "Quarterfinals", theme);
    if (effectiveSF.length) addRoundLabel(sfCol, "Semifinals", theme);
    addRoundLabel(finalCol, "Final", theme);

    // Render cards
    orderedQF.forEach(g => qfCol.appendChild(createGameCard(g, "QF", theme, false)));
    effectiveSF.forEach(g => sfCol.appendChild(createGameCard(g, "SF", theme, false)));
    finalGames.forEach(g => finalCol.appendChild(createGameCard(g, "FINAL", theme, true)));

    // Append columns (hide empty ones)
    if (orderedQF.length) wrapper.appendChild(qfCol);
    if (effectiveSF.length) wrapper.appendChild(sfCol);
    wrapper.appendChild(finalCol);

    container.appendChild(wrapper);

    // SVG connectors
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "bracket-lines");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    container.appendChild(svg);

    function connect(el1, el2) {
      if (!el1 || !el2) return;

      const r1 = el1.getBoundingClientRect();
      const r2 = el2.getBoundingClientRect();
      const c = container.getBoundingClientRect();

      const x1 = r1.right - c.left;
      const y1 = r1.top + r1.height / 2 - c.top;

      const x2 = r2.left - c.left;
      const y2 = r2.top + r2.height / 2 - c.top;

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke", "rgba(255,255,255,0.25)");
      line.setAttribute("stroke-width", "2");

      svg.appendChild(line);
    }

    // Connect QF → SF
    effectiveSF.forEach(sf => {
      const sfMatch = sf.Match;
      const sfEl = sfCol.querySelector(`[data-match="${sfMatch}"]`);
      const qfs = qfByNext[sfMatch] || [];
      qfs.forEach(qf => {
        const qfEl = qfCol.querySelector(`[data-match="${qf.Match}"]`);
        connect(qfEl, sfEl);
      });
    });

    // Connect SF → Final
    finalGames.forEach(final => {
      const finalMatch = final.Match;
      const finalEl = finalCol.querySelector(`[data-match="${finalMatch}"]`);
      const sfs = sfByNext[finalMatch] || [];
      sfs.forEach(sf => {
        const sfEl = sfCol.querySelector(`[data-match="${sf.Match}"]`);
        connect(sfEl, finalEl);
      });
    });

    // ⭐ CHAMPION + RUNNER-UP BOX ⭐
    if (finalGames.length > 0) {
      const final = finalGames[0];

      const home = final.HomeTeam;
      const away = final.AwayTeam;
      const hs = Number(final.HomeScore);
      const as = Number(final.AwayScore);

      let champion = "";
      let runnerUp = "";

      if (hs > as) {
        champion = home;
        runnerUp = away;
      } else {
        champion = away;
        runnerUp = home;
      }

      const champBox = document.createElement("div");
      champBox.style.marginTop = "18px";
      champBox.style.padding = "12px 16px";
      champBox.style.borderRadius = "10px";
      champBox.style.background = "rgba(246,169,74,0.12)";
      champBox.style.border = `1px solid ${theme.gold}`;
      champBox.style.textAlign = "center";
      champBox.style.fontSize = "0.95rem";
      champBox.style.lineHeight = "1.4";

      champBox.innerHTML = `
        <div style="font-weight:700; color:${theme.gold}; margin-bottom:4px;">
          🏆 Champion: ${champion}
        </div>
        <div style="font-weight:600; color:${theme.text}; opacity:0.85;">
          🥈 Runner-Up: ${runnerUp}
        </div>
      `;

      container.appendChild(champBox);
    }
  }

  return {
    renderBracket
  };

})();

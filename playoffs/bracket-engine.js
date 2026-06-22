// HAYSA Bracket Engine — Supports QF→QF Chains + QF+QF→SF Forks + Correct Centering + Correct Connectors

window.HAYSA_BRACKET_ENGINE = (function () {

  // Identify HAYSA/HOLBROOK/AVON/HOLA teams
  function isHaysaTeam(name) {
    if (!name) return false;
    const n = name.toUpperCase();
    const indicators = ["HOLA", "HOLBROOK", "AVON", "HAYSA", "HOLBROOK AVON", "(H)"];
    return indicators.some(key => n.includes(key));
  }

  // Format date/time safely
  function formatDateTime(dateStr, timeStr) {
    if (!dateStr || dateStr === "-" || dateStr === "") return "";
    try {
      const d = new Date(dateStr);
      let datePart = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });

      let timePart = "";
      if (timeStr && timeStr !== "-" && timeStr !== "") {
        const t = new Date(timeStr);
        timePart = t.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
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

  // Recursively collect chain matches
  function collectChain(startMatch, qfByNext) {
    const chain = [];
    let current = startMatch;

    while (qfByNext[current] && qfByNext[current].length === 1) {
      const nextQF = qfByNext[current][0];
      chain.push(nextQF);
      current = nextQF.Match;
    }

    return chain;
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

    // Identify the Final
    const final = finalGames[0];
    const finalMatch = final ? final.Match : null;

    // Identify SFs feeding the Final
    let effectiveSF = finalMatch ? (sfByNext[finalMatch] || []) : [];
    if (!effectiveSF.length) effectiveSF = sfGames.slice();

    // Build QF structures
    const qfStructures = [];

    effectiveSF.forEach(sf => {
      const sfMatch = sf.Match;
      const directQFs = qfByNext[sfMatch] || [];

      if (directQFs.length === 1) {
        // CHAIN CASE
        const chainStart = directQFs[0];
        const chain = [chainStart, ...collectChain(chainStart.Match, qfByNext)];
        qfStructures.push({ type: "chain", chain, sf });
      } else if (directQFs.length > 1) {
        // FORK CASE
        qfStructures.push({ type: "fork", qfs: directQFs, sf });
      }
    });

    // Build columns
    const qfCol = document.createElement("div");
    const sfCol = document.createElement("div");
    const finalCol = document.createElement("div");

    qfCol.style.display = "flex";
    qfCol.style.flexDirection = "column";
    qfCol.style.gap = "20px";

    sfCol.style.display = "flex";
    sfCol.style.flexDirection = "column";
    sfCol.style.gap = "20px";

    finalCol.style.display = "flex";
    finalCol.style.flexDirection = "column";
    finalCol.style.justifyContent = "center";
    finalCol.style.alignItems = "center";

    addRoundLabel(qfCol, "Quarterfinals", theme);
    addRoundLabel(sfCol, "Semifinals", theme);
    addRoundLabel(finalCol, "Final", theme);

    // Render QF structures
    qfStructures.forEach(struct => {
      if (struct.type === "chain") {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.flexDirection = "row";
        row.style.gap = "20px";

        struct.chain.forEach(qf => {
          row.appendChild(createGameCard(qf, "QF", theme, false));
        });

        qfCol.appendChild(row);

        // Render SF
        const sfCard = createGameCard(struct.sf, "SF", theme, false);
        sfCol.appendChild(sfCard);

      } else if (struct.type === "fork") {
        const forkWrapper = document.createElement("div");
        forkWrapper.style.display = "flex";
        forkWrapper.style.flexDirection = "column";
        forkWrapper.style.gap = "20px";

        struct.qfs.forEach(qf => {
          forkWrapper.appendChild(createGameCard(qf, "QF", theme, false));
        });

        qfCol.appendChild(forkWrapper);

        // Center SF
        const sfSlot = document.createElement("div");
        sfSlot.style.display = "flex";
        sfSlot.style.flexDirection = "column";
        sfSlot.style.justifyContent = "center";
        sfSlot.style.minHeight = `${struct.qfs.length * 70}px`;

        sfSlot.appendChild(createGameCard(struct.sf, "SF", theme, false));
        sfCol.appendChild(sfSlot);
      }
    });

    // Render Final
    finalGames.forEach(g => finalCol.appendChild(createGameCard(g, "FINAL", theme, true)));

    wrapper.appendChild(qfCol);
    wrapper.appendChild(sfCol);
    wrapper.appendChild(finalCol);

    container.appendChild(wrapper);

    // SVG connectors
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.style.position = "absolute";
    svg.style.top = "0";
    svg.style.left = "0";
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.pointerEvents = "none";
    container.appendChild(svg);

    function connect(el1, el2, straight = false) {
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
      line.setAttribute("y2", straight ? y1 : y2);
      line.setAttribute("stroke", "rgba(255,255,255,0.25)");
      line.setAttribute("stroke-width", "2");

      svg.appendChild(line);
    }

    // Draw connectors
    qfStructures.forEach(struct => {
      if (struct.type === "chain") {
        const chain = struct.chain;

        // QF → QF straight connectors
        for (let i = 0; i < chain.length - 1; i++) {
          const el1 = qfCol.querySelector(`[data-match="${chain[i].Match}"]`);
          const el2 = qfCol.querySelector(`[data-match="${chain[i + 1].Match}"]`);
          connect(el1, el2, true);
        }

        // Last QF → SF
        const lastQF = chain[chain.length - 1];
        const qfEl = qfCol.querySelector(`[data-match="${lastQF.Match}"]`);
        const sfEl = sfCol.querySelector(`[data-match="${struct.sf.Match}"]`);
        connect(qfEl, sfEl, true);

      } else if (struct.type === "fork") {
        struct.qfs.forEach(qf => {
          const qfEl = qfCol.querySelector(`[data-match="${qf.Match}"]`);
          const sfEl = sfCol.querySelector(`[data-match="${struct.sf.Match}"]`);
          connect(qfEl, sfEl, false);
        });
      }
    });

    // SF → Final
    finalGames.forEach(final => {
      const finalEl = finalCol.querySelector(`[data-match="${final.Match}"]`);
      const sfs = sfByNext[final.Match] || [];
      sfs.forEach(sf => {
        const sfEl = sfCol.querySelector(`[data-match="${sf.Match}"]`);
        connect(sfEl, finalEl, true);
      });
    });

    // Champion box
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

  return { renderBracket };

})();

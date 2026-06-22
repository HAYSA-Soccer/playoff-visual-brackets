// HAYSA Bracket Engine — Full Drop‑In Rebuild

window.HAYSA_BRACKET_ENGINE = (function () {

  // Highlight HAYSA/HOLA/HOLBROOK teams
  function isHaysaTeam(name) {
    if (!name) return false;
    const n = name.toUpperCase();
    return n.includes("HOLA") || n.includes("HOLBROOK") || n.includes("HAYSA");
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
  function createGameCard(game, roundLabel, theme) {
    const card = document.createElement("div");
    card.style.borderRadius = "10px";
    card.style.border = `1px solid ${theme.borderSoft}`;
    card.style.background = theme.cardBg;
    card.style.padding = "6px 8px";
    card.style.fontSize = "0.8rem";

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

      const nameSpan = document.createElement("span");
      nameSpan.textContent = name || "";
      nameSpan.style.fontWeight = isHaysaTeam(name) ? "700" : "500";
      nameSpan.style.color = isHaysaTeam(name) ? theme.orange : theme.text;

      const scoreSpan = document.createElement("span");
      scoreSpan.textContent = score !== undefined && score !== "" ? score : "";
      scoreSpan.style.fontWeight = "600";
      scoreSpan.style.color = theme.gold;

      row.appendChild(nameSpan);
      row.appendChild(scoreSpan);
      card.appendChild(row);
    }

    addTeamRow(game.HomeTeam, game.HomeScore);
    addTeamRow(game.AwayTeam, game.AwayScore);

    return card;
  }

  // Main render function
  function renderBracket(container, data, options) {
    const theme = options.theme || {};
    const divisionCode = options.divisionCode || "";

    container.innerHTML = "";
    container.style.position = "relative";

    const wrapper = document.createElement("div");
    wrapper.style.display = "grid";
    wrapper.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
    wrapper.style.gap = "10px";
    wrapper.style.alignItems = "stretch";

    const qfGames = data.QF || [];
    const sfGames = data.SF || [];
    const finalGames = data.FINAL || [];

    const qfCol = document.createElement("div");
    const sfCol = document.createElement("div");
    const finalCol = document.createElement("div");

    qfCol.style.display = "flex";
    qfCol.style.flexDirection = "column";
    qfCol.style.gap = "8px";

    sfCol.style.display = "flex";
    sfCol.style.flexDirection = "column";
    sfCol.style.gap = "12px";

    finalCol.style.display = "flex";
    finalCol.style.flexDirection = "column";
    finalCol.style.justifyContent = "center";

    qfGames.forEach(g => qfCol.appendChild(createGameCard(g, "QF", theme)));
    sfGames.forEach(g => sfCol.appendChild(createGameCard(g, "SF", theme)));
    finalGames.forEach(g => finalCol.appendChild(createGameCard(g, "FINAL", theme)));

    wrapper.appendChild(qfCol);
    wrapper.appendChild(sfCol);
    wrapper.appendChild(finalCol);

    container.appendChild(wrapper);
  }

  // Export API
  return {
    renderBracket
  };

})();

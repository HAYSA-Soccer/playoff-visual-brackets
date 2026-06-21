// HAYSA Bracket Engine
// Renders a single division bracket into a container element.
// Expects data from Apps Script with games and teams.

window.HAYSA_BRACKET_ENGINE = (function () {
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

    // Simple assumption: data contains arrays for QF, SF, Final
    const qfGames = data.QF || data.quarterfinals || [];
    const sfGames = data.SF || data.semifinals || [];
    const finalGames = data.FINAL || data.final || [];

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

    // Helper to create game card
    function createGameCard(game, roundLabel, isFinal) {
      const card = document.createElement("div");
      card.style.borderRadius = "10px";
      card.style.border = `1px solid ${theme.borderSoft || "#1F2937"}`;
      card.style.background = theme.cardBg || "#111827";
      card.style.padding = "6px 8px";
      card.style.position = "relative";
      card.style.fontSize = "0.8rem";

      const header = document.createElement("div");
      header.style.display = "flex";
      header.style.justifyContent = "space-between";
      header.style.alignItems = "center";
      header.style.marginBottom = "4px";

      const round = document.createElement("span");
      round.textContent = roundLabel;
      round.style.fontWeight = "600";
      round.style.letterSpacing = "0.04em";
      round.style.textTransform = "uppercase";
      round.style.color = theme.royal || "#1B3A8A";

      const meta = document.createElement("span");
      meta.style.fontSize = "0.7rem";
      meta.style.color = "#9CA3AF";
      meta.textContent = game.DateTime || game.Date || "";

      header.appendChild(round);
      header.appendChild(meta);

      const teams = document.createElement("div");
      teams.style.display = "flex";
      teams.style.flexDirection = "column";
      teams.style.gap = "2px";

      function teamRow(name, score, isWinner) {
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.padding = "2px 0";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = name || "";
        nameSpan.style.color = isWinner ? (theme.orange || "#F47A20") : "#E5E7EB";
        nameSpan.style.fontWeight = isWinner ? "600" : "400";

        const scoreSpan = document.createElement("span");
        scoreSpan.textContent = score != null ? score : "";
        scoreSpan.style.color = isWinner ? (theme.orange || "#F47A20") : "#9CA3AF";
        scoreSpan.style.fontWeight = isWinner ? "600" : "400";

        row.appendChild(nameSpan);
        row.appendChild(scoreSpan);
        return row;
      }

      const homeWinner = game.HomeWinner === true || game.Winner === "Home";
      const awayWinner = game.AwayWinner === true || game.Winner === "Away";

      teams.appendChild(
        teamRow(game.HomeTeam || game.Team1 || "", game.HomeScore ?? game.Score1, homeWinner)
      );
      teams.appendChild(
        teamRow(game.AwayTeam || game.Team2 || "", game.AwayScore ?? game.Score2, awayWinner)
      );

      const footer = document.createElement("div");
      footer.style.marginTop = "4px";
      footer.style.display = "flex";
      footer.style.justifyContent = "space-between";
      footer.style.alignItems = "center";

      const winnerLabel = document.createElement("span");
      winnerLabel.style.fontSize = "0.7rem";
      winnerLabel.style.color = "#9CA3AF";

      const winnerName =
        homeWinner ? (game.HomeTeam || game.Team1 || "") :
        awayWinner ? (game.AwayTeam || game.Team2 || "") :
        "";

      if (winnerName) {
        winnerLabel.textContent = `Winner: ${winnerName}`;
      } else {
        winnerLabel.textContent = "Winner TBD";
      }

      const advanceLabel = document.createElement("span");
      advanceLabel.style.fontSize = "0.7rem";
      advanceLabel.style.color = theme.orange || "#F47A20";
      advanceLabel.style.fontWeight = "500";

      if (!isFinal) {
        advanceLabel.textContent = "Winner advances →";
      } else {
        advanceLabel.textContent = "Champion 🏆";
      }

      footer.appendChild(winnerLabel);
      footer.appendChild(advanceLabel);

      card.appendChild(header);
      card.appendChild(teams);
      card.appendChild(footer);

      if (isFinal && winnerName) {
        card.style.border = `1px solid ${theme.orange || "#F47A20"}`;
        card.style.boxShadow = `0 0 0 1px rgba(244, 122, 32, 0.5), 0 0 18px rgba(244, 122, 32, 0.35)`;
      }

      return card;
    }

    // Quarterfinals
    qfGames.forEach((game, idx) => {
      const card = createGameCard(game, `QF ${idx + 1}`, false);
      qfCol.appendChild(card);
    });

    // Semifinals
    sfGames.forEach((game, idx) => {
      const card = createGameCard(game, `SF ${idx + 1}`, false);
      sfCol.appendChild(card);
    });

    // Final
    finalGames.forEach((game, idx) => {
      const card = createGameCard(game, `Final`, true);
      finalCol.appendChild(card);
    });

    wrapper.appendChild(qfCol);
    wrapper.appendChild(sfCol);
    wrapper.appendChild(finalCol);

    container.appendChild(wrapper);
  }

  return {
    renderBracket
  };
})();

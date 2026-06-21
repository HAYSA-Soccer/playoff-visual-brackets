// HAYSA Bracket Engine — Full Drop‑In

window.HAYSA_BRACKET_ENGINE = (function () {

  function isHaysaTeam(name) {
    if (!name) return false;
    const n = name.toUpperCase();
    return n.includes("HOLA") || n.includes("HOLBROOK") || n.includes("HAYSA");
  }

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

    function createGameCard(game, roundLabel, isFinal) {
      const card = document.createElement("div");
      card.style.borderRadius = "10px";
      card.style.border = `1px solid ${theme.borderSoft}`;
      card.style.background = theme.cardBg;
      card.style.padding = "6px 8px";
      card.style.fontSize = "0.8rem";

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

      const primaryMeta = document.createElement("span");
      primaryMeta.style.fontSize = "0.7rem";
      primaryMeta.style.color = "#9CA3AF";
      primaryMeta

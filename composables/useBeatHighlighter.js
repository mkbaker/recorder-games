export function useBeatHighlighter(notes, stave, context) {
  const removeBeatHighlight = () => {
    document.querySelectorAll(".beat-highlight").forEach((el) => {
      el.remove();
    });
  };

  const highlightBeat = (index) => {
    if (index < 0) {
      removeBeatHighlight();
      return;
    }

    removeBeatHighlight();

    const note = notes.value[index];
    const x = note.getAbsoluteX();
    const staveY = stave.value.getYForLine(0);

    const rect = context.value.rect(
      x - 15, // Offset left to fully contain note
      staveY - 20, // Offset up to contain note stem
      40, // Width to contain note
      120, // Height to contain full note
      {
        class: "beat-highlight",
        fill: "rgba(255, 215, 0, 0.2)",
        stroke: "rgba(255, 215, 0, 0.9)",
        "stroke-width": 2,
        "stroke-linejoin": "round",
        filter: "drop-shadow(0px 0px 15px rgba(255, 215, 0, 0.9))",
      }
    );
  };

  return {
    removeBeatHighlight,
    highlightBeat,
  };
}

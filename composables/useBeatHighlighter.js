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
      x - 10, // Offset left to fully contain note
      staveY - 10, // Offset up to contain note stem
      30, // Width to contain note
      100, // Height to contain full note
      {
        class: "beat-highlight",
        fill: "none",
        stroke: "#2196F3",
        "stroke-width": 2,
      }
    );
  };

  return {
    removeBeatHighlight,
    highlightBeat,
  };
}

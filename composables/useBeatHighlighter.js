export function useBeatHighlighter(notes, stave, context) {
  let highlightEl = null;

  const fill = "rgba(255, 215, 0, 0.3)";
  const stroke = "rgba(255, 215, 0, 0.8)";
  const removeBeatHighlight = () => {
    if (highlightEl) {
      highlightEl.remove();
      highlightEl = null;
    }
  };

  const highlightBeat = (index) => {
    if (index < 0) {
      removeBeatHighlight();
      return;
    }

    const note = notes.value[index];
    const x = note.getAbsoluteX();
    const staveY = stave.value.getYForLine(0);

    if (!highlightEl) {
      // Create highlight if it doesn't exist
      highlightEl = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      highlightEl.setAttribute("class", "beat-highlight");
      highlightEl.setAttribute("fill", fill);
      highlightEl.setAttribute("stroke", stroke);
      highlightEl.setAttribute("stroke-width", "4");
      highlightEl.setAttribute("rx", "10");

      // Append to VexFlow's SVG layer
      context.value.svg.appendChild(highlightEl);
    }

    // Update position dynamically
    highlightEl.setAttribute("x", x - 15);
    highlightEl.setAttribute("y", staveY - 20);
    highlightEl.setAttribute("width", "40");
    highlightEl.setAttribute("height", "120");

    // Add a glowing animation effect
    highlightEl.style.transition = "transform 0.2s ease-out, opacity 0.3s";
    highlightEl.style.opacity = "1";
    // highlightEl.style.transform = "scale(1)";

    // Smoothly fade out after moving
    setTimeout(() => {
      highlightEl.style.opacity = "0.6";
      // highlightEl.style.transform = "scale(1)";
    }, 150);
  };

  return {
    removeBeatHighlight,
    highlightBeat,
  };
}

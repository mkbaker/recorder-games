import {
  Renderer,
  Stave,
  //   StaveNote,
  Voice,
  Formatter,
  //   TickContext,
  //   Accidental,
} from "vexflow";

export const useRenderMusic = (vexContainer, stave, voice, context, notes) => {
  const { topValue, bottomValue, timeSignature } = useTimeSignature();
  const { applyNoteColors, setStemDirection } = useNoteStyler();

  const setupStave = (width, padding = 40) => {
    const staveWidth = width - 60;
    stave.value = new Stave(padding, padding, staveWidth);
    stave.value
      .addClef("treble")
      .addTimeSignature(`${topValue.value}/${bottomValue.value}`);
    stave.value.setContext(context.value).draw();
  };

  const setupVoice = (width) => {
    voice.value = new Voice({
      num_beats: timeSignature.value[0],
      beat_value: timeSignature.value[1],
    });
    voice.value.addTickables(notes.value);
    new Formatter().joinVoices([voice.value]).format([voice.value], width);
    voice.value.draw(context.value, stave.value);
  };

  const setupRenderer = (
    containerWidth,
    containerHeight = 500,
    padding = 40
  ) => {
    const width = containerWidth - padding;
    const height = containerHeight - padding;
    const renderer = new Renderer(vexContainer.value, Renderer.Backends.SVG);
    renderer.resize(width, height);
    context.value = renderer.getContext();
    return { width, height };
  };

  const renderMusic = () => {
    const containerWidth = vexContainer.value.clientWidth;

    const { width } = setupRenderer(containerWidth);
    setupStave(width);
    applyNoteColors(notes.value);
    setStemDirection(notes.value);
    setupVoice(width);
  };

  const clearExistingMusic = () => {
    while (vexContainer.value.firstChild) {
      vexContainer.value.removeChild(vexContainer.value.firstChild);
    }
    context.value = null;
  };

  const handleResize = () => {
    if (!vexContainer.value || !context.value || !stave.value || !voice.value)
      return;

    // Debounce the resize handler
    if (window.resizeTimeout) {
      clearTimeout(window.resizeTimeout);
    }

    window.resizeTimeout = setTimeout(() => {
      clearExistingMusic();
      renderMusic();
    }, 250); // Wait 250ms after resize stops before re-rendering
  };

  return {
    setupStave,
    setupVoice,
    setupRenderer,
    renderMusic,
    clearExistingMusic,
    handleResize,
  };
};

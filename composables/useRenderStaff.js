import { Renderer, Stave } from "vexflow";

export const useRenderStaff = (vexContainer, stave, context) => {
  const setupRenderer = (
    containerWidth,
    containerHeight = 500,
    padding = 40
  ) => {
    let width = containerWidth - padding;
    if (width < 0) {
      // sorry about this tech debt
      width = 150;
    }

    const height = containerHeight - padding;
    const renderer = new Renderer(vexContainer.value, Renderer.Backends.SVG);
    renderer.resize(width, height);
    context.value = renderer.getContext();
    return { width, height };
  };

  const setupStave = (width, padding = 40) => {
    const staveWidth = width - 60;
    stave.value = new Stave(padding, padding, staveWidth);
    stave.value.addClef("treble");
    stave.value.setContext(context.value).draw();
  };

  const renderStaff = () => {
    const containerWidth = vexContainer.value.clientWidth;

    const { width } = setupRenderer(containerWidth);
    setupStave(width);
  };

  return {
    setupRenderer,
    setupStave,
    renderStaff,
  };
};

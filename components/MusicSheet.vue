<script setup>
import { Renderer, Stave, StaveNote, Voice, Formatter } from "vexflow";

const vexContainer = ref(null);

onMounted(() => {
  const renderer = new Renderer(vexContainer.value, Renderer.Backends.SVG);
  renderer.resize(400, 200);
  const context = renderer.getContext();
  const stave = new Stave(10, 40, 300);
  stave.addClef("treble").setContext(context).draw();

  const notes = [
    new StaveNote({ keys: ["c/4"], duration: "q", color: "red" }),
    new StaveNote({ keys: ["d/4"], duration: "q", color: "blue" }),
    new StaveNote({ keys: ["e/4"], duration: "q", color: "green" }),
    new StaveNote({ keys: ["f/4"], duration: "q", color: "orange" }),
  ];

  const voice = new Voice({ num_beats: 4, beat_value: 4 });
  voice.addTickables(notes);

  new Formatter().joinVoices([voice]).format([voice], 300);
  voice.draw(context, stave);
});
</script>

<template>
  <div ref="vexContainer"></div>
</template>

<style lang="scss" scoped>
div {
  border: 1px dashed blue;
}
</style>

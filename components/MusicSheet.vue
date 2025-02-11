<script setup>
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  TickContext,
  Accidental,
} from "vexflow";
import { useNoteStyler } from "~/composables/useNoteStyler";
import { Howl } from "howler";

const vexContainer = ref(null);
const { applyNoteColors } = useNoteStyler();
const isLoading = ref(true);

const { beatDuration } = useTempo();
const isPlaying = ref(false);
const currentNoteIndex = ref(-1);
let playbackInterval;

const notes = ref([
  new StaveNote({ keys: ["c/4"], duration: "q" }),
  new StaveNote({ keys: ["d/4"], duration: "q" }),
  new StaveNote({ keys: ["e/4"], duration: "q" }),
  new StaveNote({ keys: ["f/4"], duration: "q" }),
]);

let currentSound = null;

const playNote = (note) => {
  if (currentSound) {
    currentSound.stop();
  }
  // const noteName = note.keys[0].split("/")[0].toLowerCase();
  const sound = new Howl({
    // src: [`/sounds/${noteName}4.mp3`], // You'll add these sound files later
    src: ["/sounds/c.wav"],
    volume: 1.0,
  });
  currentSound = sound;
  sound.play();
};

const context = ref(null);
const stave = ref(null);
const voice = ref(null);

const { highlightNote } = useNoteHighlighter(notes, stave, context);

const startPlayback = () => {
  if (isPlaying.value) return;
  isPlaying.value = true;
  currentNoteIndex.value = 0;

  playbackInterval = setInterval(() => {
    if (currentNoteIndex.value >= notes.value.length) {
      stopPlayback();
      return;
    }

    const currentNote = notes.value[currentNoteIndex.value];
    highlightNote(currentNoteIndex.value);
    playNote(currentNote);
    currentNoteIndex.value++;
  }, beatDuration.value);
};

const stopPlayback = () => {
  isPlaying.value = false;
  currentNoteIndex.value = -1;
  clearInterval(playbackInterval);
  highlightNote(-1);
};

const setupStave = (width, padding = 40) => {
  const staveWidth = width - 60;
  stave.value = new Stave(padding, padding, staveWidth);
  stave.value.addClef("treble").setContext(context.value).draw();
  stave.value.addTimeSignature("4/4").setContext(context.value).draw();
};

const setupVoice = (width) => {
  voice.value = new Voice({ num_beats: 4, beat_value: 4 });
  voice.value.addTickables(notes.value);
  new Formatter().joinVoices([voice.value]).format([voice.value], width);
  voice.value.draw(context.value, stave.value);
};

const setupRenderer = (containerWidth, containerHeight = 500, padding = 40) => {
  const width = containerWidth - padding;
  const height = containerHeight - padding;
  const renderer = new Renderer(vexContainer.value, Renderer.Backends.SVG);
  renderer.resize(width, height);
  context.value = renderer.getContext();
  return { width, height };
};

const handleResize = () => {
  if (!vexContainer.value || !context.value || !stave.value || !voice.value)
    return;

  // Debounce the resize handler
  if (window.resizeTimeout) {
    clearTimeout(window.resizeTimeout);
  }

  window.resizeTimeout = setTimeout(() => {
    // Remove existing SVG element
    while (vexContainer.value.firstChild) {
      vexContainer.value.removeChild(vexContainer.value.firstChild);
    }
    context.value = null;

    // Get container dimensions
    const containerWidth = vexContainer.value.clientWidth;

    const { width } = setupRenderer(containerWidth);
    setupStave(width);
    setupVoice(width);
  }, 250); // Wait 250ms after resize stops before re-rendering
};

onBeforeMount(() => {
  window.addEventListener("resize", handleResize);
});

onMounted(() => {
  isLoading.value = true;

  // Get container dimensions
  const containerWidth = vexContainer.value.clientWidth;

  const { width } = setupRenderer(containerWidth);
  setupStave(width);
  applyNoteColors(notes.value);
  setupVoice(width);

  // const note = new StaveNote({ keys: ["g/4", "bb/4", "d/5"], duration: "8" })
  //   .setStave(stave.value)
  //   .addModifier(new Accidental("b"), 1);

  // note.setStyle({
  //   shadowBlur: 2,
  //   shadowColor: "blue",
  //   fillStyle: "blue",
  //   strokeStyle: "blue",
  // });

  // new TickContext().addTickable(note).preFormat().setX(25);

  // stave.value.setContext(context.value).draw();
  // note.setContext(context.value).draw();
  isLoading.value = false;
});

onUnmounted(() => {
  stopPlayback();
});
</script>

<template>
  <div class="music-sheet">
    <LoadingWave v-if="isLoading" />
    <div ref="vexContainer"></div>
    <div v-if="!isLoading" class="controls">
      <Metronome :is-playing="isPlaying" />
      <button @click="startPlayback" :disabled="isPlaying">Play</button>
      <button @click="stopPlayback" :disabled="!isPlaying">Stop</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.music-sheet {
  border: 1px dashed blue;
  padding: 10px;
}

.controls {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

input[type="number"] {
  width: 60px;
  margin: 0 5px;
}

button {
  padding: 5px 15px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: #f0f0f0;
  }
}
</style>

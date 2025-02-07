<script setup>
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  // TickContext,
} from "vexflow";
import { useNoteStyler } from "~/composables/useNoteStyler";
import { useNoteColors } from "~/composables/useNoteColors";
import { Howl } from "howler";

const vexContainer = ref(null);
const { applyNoteColors } = useNoteStyler();
const { noteColors } = useNoteColors();
const isLoading = ref(true);

const tempo = ref(120);
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

  const beatDuration = 60000 / tempo.value; // milliseconds per beat

  playbackInterval = setInterval(() => {
    if (currentNoteIndex.value >= notes.value.length) {
      stopPlayback();
      return;
    }

    const currentNote = notes.value[currentNoteIndex.value];
    highlightNote(currentNoteIndex.value);
    playNote(currentNote);
    currentNoteIndex.value++;
  }, beatDuration);
};

const stopPlayback = () => {
  isPlaying.value = false;
  currentNoteIndex.value = -1;
  clearInterval(playbackInterval);
  highlightNote(-1);
};

onMounted(() => {
  isLoading.value = true;
  const renderer = new Renderer(vexContainer.value, Renderer.Backends.SVG);
  renderer.resize(400, 200);
  context.value = renderer.getContext();
  stave.value = new Stave(10, 40, 350);
  stave.value.addClef("treble").setContext(context.value).draw();
  stave.value.addTimeSignature("4/4").setContext(context.value).draw();

  applyNoteColors(notes.value);

  voice.value = new Voice({ num_beats: 4, beat_value: 4 });
  voice.value.addTickables(notes.value);

  new Formatter().joinVoices([voice.value]).format([voice.value], 300);
  voice.value.draw(context.value, stave.value);
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
      <label>
        Tempo:
        <input
          type="number"
          v-model="tempo"
          min="40"
          max="208"
          :disabled="isPlaying"
        />
        BPM
      </label>
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

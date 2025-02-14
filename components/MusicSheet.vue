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
import { Howl } from "howler";
import { Play, Pause } from "lucide-vue-next";

const vexContainer = ref(null);
const { applyNoteColors } = useNoteStyler();
const isLoading = ref(true);

const { beatDuration, tempo } = useTempo();
const timeSignature = [3, 4];
let playbackInterval;

const { melody, generateMelody } = useRandomMelody(timeSignature);

const notes = computed(() => {
  return melody.value.map((note) => {
    return new StaveNote({ keys: [note], duration: "q" });
  });
});

const context = ref(null);
const stave = ref(null);
const voice = ref(null);

const { highlightBeat } = useBeatHighlighter(notes, stave, context);

///////////////////////
/// playback module ///
///////////////////////
const isPlaying = ref(false);

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

const currentNoteIndex = ref(-1);
const countOffIndex = ref(-1);

const playCountOff = () => {
  return new Promise((resolve) => {
    // let currentSound;
    const sound = new Howl({
      src: ["/sounds/metronome_up.wav"],
      volume: 1.0,
    });
    // currentSound = sound;
    sound.play();
    countOffIndex.value = 0;

    const interval = setInterval(() => {
      sound.play();
      countOffIndex.value++;
      if (countOffIndex.value > timeSignature[0] - 1) {
        clearInterval(interval);
        resolve();
      }
    }, beatDuration.value);
  });
};

const startPlayback = async () => {
  if (isPlaying.value) return;
  await playCountOff();
  countOffIndex.value = -1;
  isPlaying.value = true;
  currentNoteIndex.value = 0;
  const currentNote = notes.value[currentNoteIndex.value];
  highlightBeat(currentNoteIndex.value);
  playNote(currentNote);
  currentNoteIndex.value++;

  playbackInterval = setInterval(() => {
    if (currentNoteIndex.value >= notes.value.length) {
      stopPlayback();
      return;
    }

    const currentNote = notes.value[currentNoteIndex.value];
    highlightBeat(currentNoteIndex.value);
    playNote(currentNote);
    currentNoteIndex.value++;
  }, beatDuration.value);
};

const stopPlayback = () => {
  isPlaying.value = false;
  currentNoteIndex.value = -1;
  clearInterval(playbackInterval);
  highlightBeat(-1);
};

const setupStave = (width, padding = 40) => {
  const staveWidth = width - 60;
  stave.value = new Stave(padding, padding, staveWidth);
  stave.value.addClef("treble").setContext(context.value).draw();
  stave.value
    .addTimeSignature(`${timeSignature[0]}/${timeSignature[1]}`)
    .setContext(context.value)
    .draw();
};

const setupVoice = (width) => {
  voice.value = new Voice({
    num_beats: timeSignature[0],
    beat_value: timeSignature[1],
  });
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

const renderMusic = () => {
  const containerWidth = vexContainer.value.clientWidth;

  const { width } = setupRenderer(containerWidth);
  setupStave(width);
  applyNoteColors(notes.value);
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

onBeforeMount(() => {
  window.addEventListener("resize", handleResize);
});

onMounted(() => {
  isLoading.value = true;
  renderMusic();
  isLoading.value = false;
});

watch(melody, () => {
  clearExistingMusic();
  renderMusic();
});

onUnmounted(() => {
  stopPlayback();
});
</script>

<template>
  <div class="music-sheet">
    <LoadingWave v-if="isLoading" />
    <div ref="vexContainer"></div>
    <div v-if="countOffIndex >= 0">{{ countOffIndex + 1 }}</div>
    <div v-if="!isLoading" class="controls">
      <Metronome :is-playing="isPlaying" />
      <button @click="generateMelody">Generate Melody</button>
      <button @click="startPlayback" :disabled="isPlaying"><Play /></button>
      <button @click="stopPlayback" :disabled="!isPlaying"><Pause /></button>
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

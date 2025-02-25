<script setup>
import { StaveNote } from "vexflow";
import { Play, Pause } from "lucide-vue-next";
import * as Tone from "tone";

const vexContainer = ref(null);
const isLoading = ref(true);

const { beatDuration, tempo } = useTempo();
const { topValue, bottomValue, timeSignature } = useTimeSignature();
const { startAudioContext } = useAudioContext();

let playbackInterval;

const { melody, generateMelody, totalBeats } = useRandomMelody(timeSignature);

const notes = computed(() => {
  return melody.value.map((note) => {
    return new StaveNote({ keys: [note], duration: "q" });
  });
});

const context = ref(null);
const stave = ref(null);
const voice = ref(null);

const { handleResize, renderMusic, clearExistingMusic } = useRenderMusic(
  vexContainer,
  stave,
  voice,
  context,
  notes
);

///////////////////////
/// playback module ///
///////////////////////
const {
  isPlaying,
  currentBeat,
  startPlayback: controllerStartPlayback,
  stopPlayback: controllerStopPlayback,
} = usePlaybackController(notes, stave, context);

const currentNoteIndex = ref(-1);
const countOffIndex = ref(-1);
const { playMetronome } = useMetronome();

const playCountOff = async () => {
  let scheduledEvents = [];
  return new Promise(async (resolve) => {
    countOffIndex.value = 0;
    await Tone.start();

    const transport = Tone.getTransport();

    for (let i = 0; i < timeSignature.value[0]; i++) {
      const time = i * (beatDuration.value / 1000);
      scheduledEvents.push(
        transport.schedule(() => {
          playMetronome();
          countOffIndex.value += 1;
        }, time)
      );
    }

    const finalBeatTime = totalBeats.value * (beatDuration.value / 1000);
    scheduledEvents.push(
      transport.schedule(() => {
        transport.stop();
        transport.cancel();
        countOffIndex.value = -1;
        resolve();
      }, finalBeatTime)
    );
    transport.start();
  });
};

const startPlayback = async () => {
  if (isPlaying.value) return;
  await startAudioContext();
  await playCountOff();
  countOffIndex.value = -1;
  controllerStartPlayback(notes.value, totalBeats.value);
};

const stopPlayback = () => {
  isPlaying.value = false;
  currentNoteIndex.value = -1;
  clearInterval(playbackInterval);
  controllerStopPlayback();
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

const updateTimeSignature = () => {
  clearExistingMusic();
  generateMelody();
  renderMusic();
};

watch([topValue, bottomValue], () => {
  updateTimeSignature();
});
</script>

<template>
  <div class="music-sheet">
    <LoadingWave v-if="isLoading" />
    <div ref="vexContainer"></div>
    <div v-if="countOffIndex >= 0">{{ countOffIndex + 1 }}</div>
    <div v-if="!isLoading" class="controls">
      <TimeSignatureControl
        :is-playing="isPlaying"
        v-model:top-value="topValue"
        v-model:bottom-value="bottomValue"
      />
      <Metronome :is-playing="isPlaying" />
      <button @click="generateMelody">Generate Melody</button>
      <button @click="startPlayback" :disabled="isPlaying"><Play /></button>
      <button @click="stopPlayback" :disabled="!isPlaying"><Pause /></button>
    </div>
  </div>
  <pre>
    currentBeat: {{ currentBeat }}
  </pre>
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

.time-signature-controls {
  display: flex;
  align-items: center;
  gap: 4px;

  input {
    width: 50px;
    padding: 4px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  span {
    font-weight: bold;
  }
}
</style>

<script setup>
import { Howl } from "howler";

const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: false,
  },
});

let currentSound = null;
const { tempo, beatDuration } = useTempo();
const playMetronomeOnly = ref(false);
let metronomeInterval;

const playMetronome = () => {
  if (currentSound) {
    currentSound.stop();
  }

  const sound = new Howl({
    src: ["/sounds/metronome_up.wav"],
    volume: 1.0,
  });
  currentSound = sound;
  sound.play();
};

const startMetronome = () => {
  clearInterval(metronomeInterval); // Clear any existing interval
  metronomeInterval = setInterval(playMetronome, beatDuration.value);
  playMetronome(); // Play immediately when starting
};

const stopMetronome = () => {
  clearInterval(metronomeInterval);
  if (currentSound) {
    currentSound.stop();
  }
};

watchEffect(() => {
  if (props.isPlaying || playMetronomeOnly.value) {
    startMetronome();
  } else {
    stopMetronome();
  }
});
// Clean up on component unmount
onUnmounted(() => {
  clearInterval(metronomeInterval);
  if (currentSound) {
    currentSound.stop();
  }
});
</script>

<template>
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
  <button @click="playMetronomeOnly = !playMetronomeOnly">
    Play Metronome
  </button>
</template>

<script setup>
import { Drum } from "lucide-vue-next";

const props = defineProps({
  isPlaying: {
    type: Boolean,
    default: false,
  },
});

const { isMetronomeEnabled, currentBeat, toggleMetronome } =
  usePlaybackController();
const { tempo } = useTempo();
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
  <button @click="toggleMetronome">
    <Drum />
    <div v-if="isMetronomeEnabled" class="slash-overlay"></div>
  </button>
</template>

<style scoped>
button {
  position: relative;
}

.slash-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.slash-overlay::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to left top,
    transparent 45%,
    currentColor 45%,
    currentColor 55%,
    transparent 55%
  );
}
</style>

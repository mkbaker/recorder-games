<script setup>
import { PitchDetector } from "pitchy";

const audioContext = ref(null);
const analyserNode = ref(null);
const detector = ref(null);
const input = ref(null);

const pitch = ref(null);
const clarity = ref(null);
const isRunning = ref(false);

const resumeAudioContext = () => {
  if (audioContext.value) {
    audioContext.value.resume();
  }
};

const updatePitch = (sampleRate) => {
  if (!isRunning.value) return;

  analyserNode.value.getFloatTimeDomainData(input.value);
  const [detectedPitch, detectedClarity] = detector.value.findPitch(
    input.value,
    sampleRate
  );
  pitch.value = Math.round(detectedPitch * 10) / 10 || 0;
  clarity.value = Math.round(detectedClarity * 100) || 0;

  requestAnimationFrame(() => updatePitch(sampleRate));
};

onMounted(() => {
  audioContext.value = new window.AudioContext();
  analyserNode.value = audioContext.value.createAnalyser();
  resumeAudioContext();
  isRunning.value = true;

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    audioContext.value
      .createMediaStreamSource(stream)
      .connect(analyserNode.value);
    detector.value = PitchDetector.forFloat32Array(analyserNode.value.fftSize);
    detector.value.minVolumeDecibels = -10;
    input.value = new Float32Array(detector.value.inputLength);
    updatePitch(audioContext.value.sampleRate);
  });
});

onUnmounted(() => {
  isRunning.value = false;
});
</script>

<template>
  <div class="tuner">
    <button @click="resumeAudioContext">resume audio context</button>
    <div>Pitch: {{ pitch }} Hz Clarity: {{ clarity }} %</div>
  </div>
</template>

<style lang="scss" scoped></style>

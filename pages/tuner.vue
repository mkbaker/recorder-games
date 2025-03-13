<script setup>
import { PitchDetector } from "pitchy";
import { StaveNote, Accidental, TickContext } from "vexflow";

const audioContext = ref(null);
const analyserNode = ref(null);
const detector = ref(null);
const input = ref(null);

const pitch = ref(null);
const clarity = ref(null);
const note = ref(null);
const isRunning = ref(false);

const output = ref(null);
const stave = ref(null);
const context = ref(null);
const tickContext = ref(null);
const { renderStaff } = useRenderStaff(output, stave, context);

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
  note.value = useHzToNote(pitch.value);

  requestAnimationFrame(() => {
    updatePitch(sampleRate);
  });
};

const renderNote = (note) => {
  console.log(note);
  if (note?.note === null) return;
  const noteName = `${note.note}/${note.octave}`;

  const renderedNote = new StaveNote({
    keys: [noteName],
    duration: "q",
  });
  renderedNote.setContext(context.value).setStave(stave.value);
  tickContext.value.addTickable(renderedNote);
  renderedNote.draw();
};

const clearExistingNote = () => {
  console.log("clear existing note");
};

watch(pitch, () => {
  if (pitch.value) {
    renderNote(note.value);
  } else {
    clearExistingNote();
  }
});

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

  renderStaff();
  tickContext.value = new TickContext();
});

onUnmounted(() => {
  isRunning.value = false;
});
</script>

<template>
  <div class="tuner">
    <button @click="resumeAudioContext">resume audio context</button>
    <div class="metadata">
      Pitch: {{ pitch }} Hz <br />Clarity: {{ clarity }} % <br />Note:
      {{ note }}
    </div>

    <div class="detected-note">
      {{ note?.note }}
    </div>

    <div id="container">
      <div ref="output" id="output"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tuner {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.detected-note {
  font-size: 5rem;
}

#container {
  width: 300px;
}
</style>

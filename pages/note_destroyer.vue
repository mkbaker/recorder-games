<script setup>
import { PitchDetector } from "pitchy";
import { StaveNote, Accidental, TickContext } from "vexflow";
const output = ref(null);
const stave = ref(null);
const context = ref(null);
const tickContext = ref(null);
const audioContext = ref(null);
const analyserNode = ref(null);
const detector = ref(null);
const input = ref(null);

const pitch = ref(null);
const clarity = ref(null);
const note = ref(null);
const isRunning = ref(null);

const { renderStaff } = useRenderStaff(output, stave, context);
const { melody, generateMelody, totalBeats } = useRandomMelody();

const score = ref(0);

const durations = ["8", "4", "2", "1"];

const availableNotes = ref([
  ["c", "#", "4"],
  ["e", "b", "5"],
  ["g", "", "5"],
  ["d", "b", "4"],
  ["b", "bb", "3"],
  ["a", "b", "4"],
  ["f", "b", "5"],
]);

const notes = computed(() => {
  //   availableNotes.value.map(([letter, accidental, octave]) => {
  return melody.value.map((n) => {
    // console.log(n);
    const note = new StaveNote({
      //   clef: "treble",
      keys: [n],
      //   duration: durations[Math.floor(Math.random() * durations.legnth)],
      duration: "q",
    });
    note.setContext(context.value).setStave(stave.value);

    // accidentals must be rendered manuially
    // if (accidental) {
    //   note.addModifier(new Accidental(accidental));
    // }
    tickContext.value.addTickable(note);
    return note;
  });
});

const visibleNoteGroups = ref([]);
const visibleNotes = ref({});

const addNote = () => {
  console.log("notes.value: ", notes.value);
  let note = notes.value.shift();
  console.log("note: ", note);
  if (!note) {
    console.log("no more notes!");
    return;
  }
  const group = context.value.openGroup();
  visibleNoteGroups.value.push(group);
  let noteId = note.attrs.id;
  visibleNotes.value[noteId] = note.keys[0];
  note.draw();
  context.value.closeGroup();
  group.classList.add("scroll");

  const box = group.getBoundingClientRect();
  group.classList.add("scrolling");

  window.setTimeout(() => {
    const index = visibleNoteGroups.value.indexOf(group);
    if (index === -1) return;
    group.classList.add("too-slow");
    visibleNoteGroups.value.shift();
    delete visibleNotes.value[noteId];
    score.value--;
  }, 5000);
};

watchEffect(() => {
  console.log("visible note groups: ", visibleNoteGroups.value);
});

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

onMounted(() => {
  renderStaff();
  generateMelody();
  tickContext.value = new TickContext();
  tickContext.value.preFormat().setX(1000); // intended to be just out of view - will likely need to increase

  // set up audio context
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
</script>

<template>
  <div class="wrapper">
    <h1>Note Destroyer</h1>

    <div id="container">
      <div ref="output" id="output"></div>
    </div>

    <button id="add-note" @click="addNote">add note</button>
    <button @click="resumeAudioContext">resume audio context</button>
  </div>

  <div>
    <pre>visible notes: {{ visibleNotes }}</pre>
    <pre>score: {{ score }}</pre>
  </div>
  <div class="metadata">
    Pitch: {{ pitch }} Hz <br />Clarity: {{ clarity }} % <br />Note:
    {{ note }}
  </div>
</template>

<style lang="scss" scoped>
#container {
  width: 1000px;
  height: 250px;
  overflow: hidden;
  border: 1px solid deeppink;
  margin: 10px;
}

#container > div {
  width: 10000px;
  height: 120px;
  white-space: nowrap;
}

#controls {
  padding: 15px;
}

#controls > button {
  margin: 5px;
}

:deep(.scroll) {
  transition: transform 5s linear, opacity 0.5s ease-out, fill 0.2s linear;
}

:deep(.scrolling) {
  transform: translate(-1000px, 0);
}

:deep(.correct) {
  opacity: 0;
}

:deep(.too-slow) {
  transform: translate(-400px, 2000px);
}
</style>

<script setup>
import { PitchDetector } from "pitchy";
import { StaveNote, Accidental, TickContext } from "vexflow";

// staff for game notes (output)
const outputContainer = ref(null);
const outputStave = ref(null);
const outputContext = ref(null);
const outputTickContext = ref(null);

// staff for input notes played
const inputContainer = ref(null);
const inputStave = ref(null);
const inputContext = ref(null);
const inputTickContext = ref(null);

const audioContext = ref(null);
const analyserNode = ref(null);
const detector = ref(null);
const input = ref(null);

const pitch = ref(null);
const clarity = ref(null);
const note = ref(null);
const isRunning = ref(null);

const { renderStaff: renderOutputStaff } = useRenderStaff(
  outputContainer,
  outputStave,
  outputContext
);

const { renderStaff: renderInputStaff } = useRenderStaff(
  inputContainer,
  inputStave,
  inputContext
);
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
    note.setContext(outputContext.value).setStave(outputStave.value);

    // accidentals must be rendered manuially
    // if (accidental) {
    //   note.addModifier(new Accidental(accidental));
    // }
    outputTickContext.value.addTickable(note);
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
  const group = outputContext.value.openGroup();
  visibleNoteGroups.value.push(group);
  let noteId = note.attrs.id;
  visibleNotes.value[noteId] = note.keys[0];
  note.draw();
  outputContext.value.closeGroup();
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

const removeCorrectNote = (noteId) => {
  console.log("removing: ", noteId);
  if (!visibleNotes.value[noteId]) return;
  console.log(visibleNoteGroups.value);
  const index = Object.keys(visibleNotes.value).indexOf(noteId);

  console.log("index: ", index);
  if (index !== -1) {
    const group = visibleNoteGroups.value[index];

    // Add 'correct' class for visual feedback
    group.classList.add("correct");

    visibleNoteGroups.value.splice(index, 1); // Remove from groups
    delete visibleNotes.value[noteId]; // Remove from visible notes
    score.value++;
  }
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

const sopranoRecorder = ref(true);
const renderNote = (note) => {
  console.log({ ...note, hz: pitch.value });
  if (note?.note === null || note?.octave === null || note?.octave < 3) return;

  let octave = sopranoRecorder.value ? note.octave - 1 : note.octave;
  const noteName = `${note.note}/${octave}`;

  const renderedNote = new StaveNote({
    keys: [noteName],
    duration: "q",
  });
  renderedNote.setContext(inputContext.value).setStave(inputStave.value);
  inputTickContext.value.addTickable(renderedNote);
  renderedNote.draw();
};

const clearExistingNote = () => {
  while (inputContainer.value.firstChild) {
    inputContainer.value.removeChild(inputContainer.value.firstChild);
  }
  inputContext.value = null;
  renderInputStaff();
};

watch(note, (newVal, oldVal) => {
  if (newVal === oldVal) {
    return;
  } else if (pitch.value > 0 && note.value?.note) {
    if (newVal !== oldVal) {
      clearExistingNote();
    }
    renderNote(note.value);
  } else if (note.value?.note) {
    clearExistingNote();
  }
});

const formatNote = (noteObj) => {
  if (!noteObj) return null;
  let octave = sopranoRecorder.value ? noteObj?.octave - 1 : noteObj?.octave;
  return `${noteObj?.note.toLowerCase()}/${octave}`;
};

watchEffect(() => {
  if (note.value?.note === null || Object.keys(visibleNotes.value).length < 1)
    return;
  let formattedPlayedNote = formatNote(note.value);
  if (!formattedPlayedNote) return;

  let playedCorrectNote = Object.keys(visibleNotes.value).find((key) => {
    // console.log(
    //   `Comparing: ${visibleNotes.value[key]} vs ${formattedPlayedNote}`
    // );
    return visibleNotes.value[key] == formattedPlayedNote;
  });
  // console.log(playedCorrectNote);
  if (playedCorrectNote) {
    // console.log("played correct note!", playedCorrectNote);
    removeCorrectNote(playedCorrectNote);
  }
});

onMounted(() => {
  renderInputStaff();
  renderOutputStaff();
  generateMelody();
  outputTickContext.value = new TickContext();
  outputTickContext.value.preFormat().setX(1000); // intended to be just out of view - will likely need to increase
  inputTickContext.value = new TickContext();

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
      <div ref="inputContainer" id="input"></div>
      <div ref="outputContainer" id="output"></div>
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
  display: flex;
  flex-flow: row nowrap;
}

#input {
  width: 100px;
  height: 120px;
  white-space: nowrap;
}

#output {
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

:deep(.correct) {
  transform: translate(400px, 2000px);
}
</style>

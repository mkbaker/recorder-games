<script setup>
import { StaveNote, Accidental, TickContext } from "vexflow";
const output = ref(null);
const stave = ref(null);
const context = ref(null);
let tickContext = ref(null);

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
    console.log(n);
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
    score.value--;
  }, 5000);
};

onMounted(() => {
  renderStaff();
  generateMelody();
  tickContext.value = new TickContext();
  tickContext.value.preFormat().setX(1000); // intended to be just out of view - will likely need to increase
});
</script>

<template>
  <div class="wrapper">
    <h1>Note Destroyer</h1>

    <div id="container">
      <div ref="output" id="output"></div>
    </div>

    <button id="add-note" @click="addNote">add note</button>
  </div>

  <div>
    <pre>visible notes: {{ visibleNoteGroups }}</pre>
    <pre>score: {{ score }}</pre>
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

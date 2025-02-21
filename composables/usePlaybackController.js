import * as Tone from "tone";
import { reactive, toRefs, onUnmounted } from "vue";

const state = reactive({
  isPlaying: false,
  isMetronomeEnabled: false,
  currentBeat: -1,
});

let scheduledEvents = [];

export function usePlaybackController(notes, stave, context) {
  const { isPlaying, isMetronomeEnabled, currentBeat } = toRefs(state);
  const { beatDuration, tempo } = useTempo();
  const { topValue } = useTimeSignature();
  const { playSynth } = useSynth();
  const { playMetronome } = useMetronome();
  // const { startAudioContext } = useAudioContext();
  const { highlightBeat } = useBeatHighlighter(notes, stave, context);

  const startPlayback = async (notes) => {
    if (isPlaying.value) return;
    isPlaying.value = true;

    await Tone.start(); // Ensure AudioContext is running
    const transport = Tone.getTransport();
    transport.cancel(); // Clear previous events
    transport.bpm.value = tempo.value;
    currentBeat.value = 0;

    // 🎵 Schedule Notes in Time
    notes.forEach((note, index) => {
      const time = index * (beatDuration.value / 1000);
      scheduledEvents.push(
        transport.schedule((time) => {
          currentBeat.value = index;
          playSynth(note.keys[0], note.duration);
          highlightBeat(currentBeat.value);
          if (isMetronomeEnabled.value) {
            playMetronome();
          }
        }, time)
      );
    });

    // 🚀 Start Tone.js Transport
    transport.start();
  };

  // 🛑 Stop Playback
  const stopPlayback = () => {
    isPlaying.value = false;
    currentBeat.value = -1;
    highlightBeat(-1);
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    scheduledEvents = [];
  };

  // 🎚️ Toggle Metronome
  const toggleMetronome = () => {
    isMetronomeEnabled.value = !isMetronomeEnabled.value;
  };

  onUnmounted(() => {
    stopPlayback();
  });

  return {
    isPlaying,
    isMetronomeEnabled,
    currentBeat,
    startPlayback,
    stopPlayback,
    toggleMetronome,
  };
}

// import * as Tone from "tone";

// const state = reactive({
//   isPlaying: false,
//   isMetronomeEnabled: false,
//   currentBeat: -1,
//   nextTickTime: 0,
// });

// export function usePlaybackController() {
//   const { isPlaying, isMetronomeEnabled, currentBeat, nextTickTime } =
//     toRefs(state);
//   const { beatDuration } = useTempo();
//   const { topValue } = useTimeSignature();
//   let tickInterval = null;

//   const startTick = () => {
//     // if (tickInterval) return;

//     currentBeat.value = 0;

//     // nextTickTime.value = performance.now() + beatDuration.value;
//     // tickInterval = setInterval(() => {
//     //   const now = performance.now();
//     //   if (now >= nextTickTime.value) {
//     //     currentBeat.value = (currentBeat.value + 1) % topValue.value;
//     //     nextTickTime.value += beatDuration.value;
//     //   }
//     // }, 10); // can this timing be smarter?
//   };

//   const stopTick = () => {
//     console.log("stopTick");
//     clearInterval(tickInterval);
//     tickInterval = null;
//     currentBeat.value = -1;
//   };

//   const toggleMetronome = () => {
//     isMetronomeEnabled.value = !isMetronomeEnabled.value;
//     if (isMetronomeEnabled.value && !isPlaying.value) {
//       startTick();
//     } else if (!isMetronomeEnabled.value && !isPlaying.value) {
//       stopTick();
//     }
//   };

//   const startPlayback = () => {
//     isPlaying.value = true;
//     startTick();
//   };

//   const stopPlayback = () => {
//     isPlaying.value = false;
//     if (!isMetronomeEnabled.value) {
//       stopTick();
//     }
//   };

//   onUnmounted(() => {
//     stopTick();
//   });

//   return {
//     isPlaying,
//     isMetronomeEnabled,
//     currentBeat,
//     nextTickTime,
//     startTick,
//     stopTick,
//     startPlayback,
//     stopPlayback,
//     toggleMetronome,
//   };
// }

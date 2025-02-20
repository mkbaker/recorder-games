import * as Tone from "tone";
import { reactive, toRefs, onUnmounted } from "vue";

const state = reactive({
  isPlaying: false,
  isMetronomeEnabled: false,
  currentBeat: -1,
});

let synth,
  scheduledEvents = [];

export function usePlaybackController() {
  const { isPlaying, isMetronomeEnabled, currentBeat, metronome } =
    toRefs(state);
  const { beatDuration } = useTempo();
  const { topValue } = useTimeSignature();
  // const { startAudioContext } = useAudioContext();

  // 🎵 Initialize Synth
  // const initializeSynth = async () => {
  //   await startAudioContext(); // Ensure AudioContext is started
  //   if (!synth) {
  //     synth = new Tone.Synth().toDestination();
  //   }
  // };

  const startPlayback = async (notes) => {
    if (state.isPlaying) return;
    state.isPlaying = true;

    // await initializeSynth();
    // await initializeMetronome();

    await Tone.start(); // Ensure AudioContext is running
    Tone.Transport.cancel(); // Clear previous events
    Tone.Transport.bpm.value = 60 * (1000 / beatDuration.value); // Set BPM
    state.currentBeat = 0;

    // 🎵 Schedule Notes in Time
    notes.forEach((note, index) => {
      const time = index * (beatDuration.value / 1000);
      scheduledEvents.push(
        Tone.Transport.schedule((time) => {
          state.currentBeat = index;
          synth.triggerAttackRelease(note.keys[0], note.duration, time);
        }, time)
      );
    });

    // 🥁 Schedule Metronome if Enabled
    if (state.isMetronomeEnabled) {
      for (let i = 0; i < topValue.value; i++) {
        const time = i * (beatDuration.value / 1000);
        scheduledEvents.push(
          Tone.Transport.schedule((time) => {
            metronome.start(time);
          }, time)
        );
      }
    }

    // 🚀 Start Tone.js Transport
    Tone.Transport.start();
  };

  // 🛑 Stop Playback
  const stopPlayback = () => {
    state.isPlaying = false;
    state.currentBeat = -1;
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clear scheduled events
    scheduledEvents = [];
  };

  // 🎚️ Toggle Metronome
  const toggleMetronome = () => {
    state.isMetronomeEnabled = !state.isMetronomeEnabled;
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

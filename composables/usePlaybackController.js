import * as Tone from "tone";
import { reactive, toRefs, onUnmounted } from "vue";

const state = reactive({
  isPlaying: false,
  currentBeat: -1,
});

let scheduledEvents = [];

export function usePlaybackController(notes, stave, context) {
  const { isPlaying, currentBeat } = toRefs(state);
  const { beatDuration, tempo } = useTempo();
  const { playSynth } = useSynth();
  const { playMetronome, metronomeOn } = useMetronome();
  const { highlightBeat } = useBeatHighlighter(notes, stave, context);
  const { startAudioContext } = useAudioContext();
  const { timeSignature } = useTimeSignature();

  const startPlayback = async (notes, totalBeats) => {
    if (isPlaying.value) return;
    isPlaying.value = true;

    await startAudioContext();
    await Tone.start(); // Ensure AudioContext is running
    const transport = Tone.getTransport();
    transport.cancel(); // Clear previous events
    transport.bpm.value = tempo.value;
    currentBeat.value = 0;

    const countoffDuration =
      timeSignature.value[0] * (beatDuration.value / 1000);

    for (let i = 0; i < timeSignature.value[0]; i++) {
      const time = i * (beatDuration.value / 1000);
      scheduledEvents.push(
        transport.schedule((time) => {
          playMetronome(time);
          // countOffIndex.value += 1;
        }, time)
      );
    }

    // 🎵 Schedule Notes in Time
    notes.forEach((note, index) => {
      const time = countoffDuration + index * (beatDuration.value / 1000);
      scheduledEvents.push(
        transport.schedule((time) => {
          console.log(`Note event at time: ${time}`);
          currentBeat.value = index;
          playSynth(note.keys[0], note.duration);
          highlightBeat(currentBeat.value);
          if (metronomeOn.value) {
            console.log(`Also triggering metronome at note event: ${time}`);
            playMetronome(time);
          }
        }, time)
      );
    });

    // stop playback when finished
    const finalBeatTime =
      countoffDuration + totalBeats * (beatDuration.value / 1000);
    scheduledEvents.push(
      transport.schedule(() => {
        stopPlayback();
      }, finalBeatTime)
    );

    transport.start();
  };

  const stopPlayback = () => {
    isPlaying.value = false;
    currentBeat.value = -1;
    highlightBeat(-1);
    const transport = Tone.getTransport();
    transport.stop();
    transport.cancel();
    scheduledEvents = [];
  };

  onUnmounted(() => {
    stopPlayback();
  });

  return {
    isPlaying,
    currentBeat,
    startPlayback,
    stopPlayback,
  };
}

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

  const startPlayback = async (notes, totalBeats) => {
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
        transport.schedule(() => {
          currentBeat.value = index;
          playSynth(note.keys[0], note.duration);
          highlightBeat(currentBeat.value);
          if (metronomeOn.value) {
            playMetronome();
          }
        }, time)
      );
    });

    // stop playback when finished
    const finalBeatTime = totalBeats * (beatDuration.value / 1000);
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

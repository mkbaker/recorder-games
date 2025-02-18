import * as Tone from "tone";
import { useAudioContext } from "./useAudioContext";

export const useSynth = () => {
  const { startAudioContext } = useAudioContext();
  let synth = null;

  const initSynth = async () => {
    await startAudioContext();
    if (!synth) {
      synth = new Tone.Synth().toDestination();
      synth.oscillator.type = "sine";
    }
  };

  const formatNote = (note) => {
    return note.replace(/\//, "");
  };

  const durationLookup = {
    q: "4n",
  };

  const playSynth = async (note = "C4", duration = "q") => {
    if (!synth) {
      await initSynth();
    }
    synth.triggerAttackRelease(formatNote(note), durationLookup[duration]);
  };

  onUnmounted(() => {
    if (synth) {
      synth.dispose();
      synth = null;
    }
  });

  return {
    initSynth,
    playSynth,
  };
};

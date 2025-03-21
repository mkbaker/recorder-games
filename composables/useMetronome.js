import * as Tone from "tone";
import { useAudioContext } from "./useAudioContext";

const state = reactive({
  metronomeOn: true,
});

export const useMetronome = () => {
  const { startAudioContext } = useAudioContext();
  const { metronomeOn } = toRefs(state);
  let metronome = null;
  let isLoaded = false;

  const initializeMetronome = async () => {
    await startAudioContext();

    if (!metronome) {
      metronome = new Tone.Player({
        url: "/sounds/metronome_up.wav",
        autostart: false,
        onload: () => {
          isLoaded = true;
        },
        onerror: (error) => console.error("❌ Metronome load error:", error),
      }).toDestination();
    }
  };

  const playMetronome = async (time) => {
    if (!metronome) {
      await initializeMetronome();
    }

    if (!isLoaded) {
      await new Promise((resolve) => {
        const checkLoaded = setInterval(() => {
          if (isLoaded) {
            clearInterval(checkLoaded);
            resolve();
          }
        }, 50);
      });
    }
    // console.log("metronome time is supposed to be: ", time);
    // console.log("Metronome triggered at:", Tone.now());
    if (time !== undefined) {
      metronome.start(time);
    } else {
      metronome.start();
    }
  };

  const toggleMetronome = () => {
    metronomeOn.value = !metronomeOn.value;
  };

  return {
    playMetronome,
    initializeMetronome,
    toggleMetronome,
    metronomeOn,
  };
};

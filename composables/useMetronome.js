import * as Tone from "tone";
import { useAudioContext } from "./useAudioContext";

export const useMetronome = () => {
  const { startAudioContext } = useAudioContext();
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

  const playMetronome = async () => {
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

    metronome.start();
  };

  return {
    playMetronome,
    initializeMetronome,
  };
};

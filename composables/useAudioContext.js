import * as Tone from "tone";

export const useAudioContext = () => {
  const isStarted = ref(false);

  const startAudioContext = async () => {
    if (!isStarted.value) {
      await Tone.start();
      isStarted.value = true;
    }
  };

  return {
    isStarted,
    startAudioContext,
  };
};

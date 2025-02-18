const state = reactive({
  isPlaying: false,
  isMetronomeEnabled: false,
  currentBeat: -1,
  nextTickTime: 0,
});

export function usePlaybackController() {
  const { isPlaying, isMetronomeEnabled, currentBeat, nextTickTime } =
    toRefs(state);
  const { beatDuration } = useTempo();
  const { topValue } = useTimeSignature();
  let tickInterval = null;

  const startTick = () => {
    console.log("startTick");
    if (tickInterval) return;

    currentBeat.value = 0;

    nextTickTime.value = performance.now() + beatDuration.value;
    tickInterval = setInterval(() => {
      const now = performance.now();
      if (now >= nextTickTime.value) {
        currentBeat.value = (currentBeat.value + 1) % topValue.value;
        nextTickTime.value += beatDuration.value;
      }
    }, 10); // can this timing be smarter?
  };

  const stopTick = () => {
    console.log("stopTick");
    clearInterval(tickInterval);
    tickInterval = null;
    currentBeat.value = -1;
  };

  const toggleMetronome = () => {
    isMetronomeEnabled.value = !isMetronomeEnabled.value;
    if (isMetronomeEnabled.value && !isPlaying.value) {
      startTick();
    } else if (!isMetronomeEnabled.value && !isPlaying.value) {
      stopTick();
    }
  };

  const startPlayback = () => {
    isPlaying.value = true;
    startTick();
  };

  const stopPlayback = () => {
    isPlaying.value = false;
    if (!isMetronomeEnabled.value) {
      stopTick();
    }
  };

  onUnmounted(() => {
    stopTick();
  });

  return {
    isPlaying,
    isMetronomeEnabled,
    currentBeat,
    nextTickTime,
    startTick,
    stopTick,
    startPlayback,
    stopPlayback,
    toggleMetronome,
  };
}

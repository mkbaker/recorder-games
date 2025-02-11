const state = reactive({
  tempo: 80,
});

export const useTempo = () => {
  const { tempo } = toRefs(state);

  const beatDuration = computed(() => 60000 / tempo.value);
  return { tempo, beatDuration };
};

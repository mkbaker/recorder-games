export const useTempo = () => {
  const tempo = ref(120);
  const beatDuration = computed(() => {
    return 60000 / tempo.value;
  });

  return { tempo, beatDuration };
};

const state = reactive({
  topValue: 4,
  bottomValue: 4,
});

export const useTimeSignature = () => {
  const { topValue, bottomValue } = toRefs(state);

  const timeSignature = computed(() => [
    parseInt(topValue.value),
    parseInt(bottomValue.value),
  ]);
  return { topValue, bottomValue, timeSignature };
};

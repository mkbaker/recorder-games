const state = reactive({
  topValue: 4,
  bottomValue: 4,
});

export const useTimesignature = () => {
  const { topValue, bottomValue } = toRefs(state);

  const timeSignature = computed(() => [
    parseInt(topValue.value),
    parseInt(bottomValue.value),
  ]);
  return { topValue, bottomValue, timeSignature };
};

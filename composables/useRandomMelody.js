const useRandomMelody = (
  timeSignature = ref([4, 4]),
  numberOfBars = ref(1),
  notes = ref(["c", "d", "e", "f", "g", "a", "b"])
) => {
  const range = ref([4]);
  const melody = ref([]);
  const timeSignatureVal = computed(() => toValue(timeSignature));
  const numberOfBarsVal = computed(() => toValue(numberOfBars));
  const melodyLength = computed(
    () => timeSignatureVal.value[0] * numberOfBarsVal.value
  );

  const generateMelody = () => {
    let result = [];
    for (let i = 0; i < melodyLength.value; i++) {
      const note = notes.value[Math.floor(Math.random() * notes.value.length)];
      const octave =
        range.value[Math.floor(Math.random() * range.value.length)];
      result.push(`${note}/${octave}`);
    }
    melody.value = result;
  };

  generateMelody();

  const totalBeats = computed(
    () => timeSignature.value[1] / numberOfBars.value
  );

  return { melody, totalBeats, generateMelody };
};

export default useRandomMelody;

const useRandomMelody = (timeSignature = [4, 4], numberOfBars = 1) => {
  const notes = ref(["c", "d", "e", "f", "g", "a", "b"]);
  const range = ref([4]);
  const melody = ref([]);
  const timeSignatureVal = toValue(timeSignature);
  const numberOfBarsVal = toValue(numberOfBars);
  const melodyLength = computed(() => timeSignatureVal[0] * numberOfBarsVal);

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

  return { melody, generateMelody };
};

export default useRandomMelody;

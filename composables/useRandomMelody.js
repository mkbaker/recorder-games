const useRandomMelody = () => {
  const notes = ref(["c", "d", "e", "f", "g", "a", "b"]);
  const range = ref([4]);
  const melody = ref([]);
  const melodyLength = ref(4);

  const generateMelody = () => {
    console.log("generateMelody");
    let result = [];
    for (let i = 0; i < melodyLength.value; i++) {
      const note = notes.value[Math.floor(Math.random() * notes.value.length)];
      const octave =
        range.value[Math.floor(Math.random() * range.value.length)];
      result.push(`${note}/${octave}`);
    }
    console.log(result);
    melody.value = result;
  };

  generateMelody();

  return { melody, generateMelody };
};

export default useRandomMelody;

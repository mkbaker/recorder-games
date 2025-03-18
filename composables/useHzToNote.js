export function useHzToNote(hz) {
  if (!hz || hz < 16.35) return { note: null, octave: null }; // Out of range

  const noteNames = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  // A4 (440 Hz) is the reference point
  const A4 = 440;
  const semitoneRatio = Math.pow(2, 1 / 12);

  // Calculate the number of semitones away from A4
  const semitonesFromA4 = Math.round(12 * Math.log2(hz / A4) + 0.01);

  // Determine the MIDI note number (A4 is MIDI 69)
  const midiNote = 69 + semitonesFromA4;

  // Calculate octave and note name
  const noteIndex = (midiNote + 3) % 12; // Shift to align C = 0
  // const noteIndex = midiNote % 12;
  const octave = Math.floor((midiNote + 3) / 12) - 1;
  const note = noteNames[noteIndex];

  return { note, octave };
}

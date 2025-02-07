import { useNoteColors } from "./useNoteColors";

export function useNoteStyler() {
  const { noteColors } = useNoteColors();

  const applyNoteColors = (notes) => {
    notes.forEach((note) => {
      const noteName = note.keys[0].split("/")[0].toLowerCase();
      if (noteColors[noteName]) {
        note.setStyle({
          fillStyle: noteColors[noteName],
          strokeStyle: noteColors[noteName],
        });
      }
    });
    return notes;
  };

  return {
    applyNoteColors,
  };
}

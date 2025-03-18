import { useNoteColors } from "./useNoteColors";

export function useNoteStyler() {
  const { noteColors } = useNoteColors();

  const getNoteName = (noteObj) => {
    return noteObj.keys[0].split("/")[0].toLowerCase();
  };
  const applyNoteColors = (notes) => {
    notes.forEach((note) => {
      const noteName = getNoteName(note);
      // outline for light colors
      if (noteName === "e") {
        note.setStyle({
          fillStyle: noteColors[noteName],
          strokeStyle: noteColors[noteName],
          shadowColor: "black",
          shadowBlur: 1,
        });
      } else if (noteColors[noteName]) {
        note.setStyle({
          fillStyle: noteColors[noteName],
          strokeStyle: noteColors[noteName],
        });
      }
    });
    return notes;
  };

  const setStemDirection = (notes) => {
    notes.forEach((note) => {
      // note.stem_direction = -1;
    });
  };

  return {
    applyNoteColors,
    setStemDirection,
  };
}

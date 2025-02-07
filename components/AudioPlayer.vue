<script setup>
import { Howl } from "howler";

const playNote = (note) => {
  const sound = new Howl({
    // src: [`/sounds/${note}.mp3`], // Ensure the sound files exist
    volume: 1.0,
  });
  sound.play();
};
</script>

<template>
  <!-- <div>
    <button @click="playNote('c4')">Play C</button>
    <button @click="playNote('d4')">Play D</button>
    <button @click="playNote('e4')">Play E</button>
  </div> -->
</template>

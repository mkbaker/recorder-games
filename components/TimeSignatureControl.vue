<script setup>
defineProps({
  isPlaying: {
    type: Boolean,
    required: true,
  },
});

const topValue = defineModel("topValue", { required: true });
const bottomValue = defineModel("bottomValue", { required: true });

const validateTopValue = (value) => {
  if (value > 6) {
    topValue.value = 6;
  }
  if (value < 2) {
    topValue.value = 2;
  } else {
    topValue.value = value;
  }
};

const validBeatDurations = [2, 4, 8];

const validateBottomValue = (value) => {
  if (!validBeatDurations.includes(value)) {
    bottomValue.value = 4;
  } else {
    bottomValue.value = value;
  }
};
</script>

<template>
  <div class="time-signature-controls">
    <input
      :disabled="isPlaying"
      type="number"
      min="2"
      max="6"
      v-model="topValue"
      @input="(e) => validateTopValue(e.target.value)"
    />
    <span>/</span>
    <input
      disabled
      type="number"
      min="2"
      v-model="bottomValue"
      @input="(e) => validateBottomValue(e.target.value)"
    />
  </div>
</template>

<script setup>
const vexContainer = ref(null);
const stave = ref(null);
const context = ref(null);

const { renderStaff } = useRenderStaff(vexContainer, stave, context);

onMounted(() => {
  renderStaff();
});
</script>

<template>
  <div class="container">
    <h1>Note Destroyer</h1>

    <div ref="vexContainer"></div>
  </div>
</template>

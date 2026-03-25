<template>
  <div class="placeholder-view">
    <h2>{{ text }}</h2>
    <p class="hint">此页面尚未实现，敬请期待。</p>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '即将推出'
  }
})
</script>

<style scoped>
.placeholder-view {
  padding: 40px;
  color: var(--el-text-color-primary);
}
.hint {
  margin-top: 8px;
  color: var(--el-text-color-secondary);
}
</style>

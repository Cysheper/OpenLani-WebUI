<template>
  <el-menu
    :default-active="route.path"
    class="sidebar-menu"
    :collapse="isCollapse"
    router
  >
    <el-menu-item index="/chat">
      <el-icon><ChatDotRound /></el-icon>
      <template #title>{{ t('navChat') }}</template>
    </el-menu-item>
    <el-menu-item index="/config">
      <el-icon><Setting /></el-icon>
      <template #title>{{ t('navConfig') }}</template>
    </el-menu-item>
    <el-menu-item index="/tasks">
      <el-icon><Operation /></el-icon>
      <template #title>{{ t('navTask') }}</template>
    </el-menu-item>
    <el-menu-item index="/extensions">
      <el-icon><Connection /></el-icon>
      <template #title>{{ t('navExtensions') }}</template>
    </el-menu-item>
    <el-menu-item index="/data">
      <el-icon><DataLine /></el-icon>
      <template #title>{{ t('navData') }}</template>
    </el-menu-item>
    <el-menu-item index="/console">
      <el-icon><Monitor /></el-icon>
      <template #title>{{ t('navConsole') }}</template>
    </el-menu-item>
  </el-menu>
</template>

<script setup>
import { inject } from 'vue'
import { useRoute } from 'vue-router'
import { 
  ChatDotRound, 
  Setting, 
  Operation, 
  Connection, 
  DataLine, 
  Monitor 
} from '@element-plus/icons-vue'

const isCollapse = inject('isNavCollapsed')
const t = inject('t')
const route = useRoute()
</script>

<style scoped>
.sidebar-menu {
  height: 100%;
  border-right: solid 1px var(--el-menu-border-color);
}
.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}
</style>
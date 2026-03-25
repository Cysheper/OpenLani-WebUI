<template>
  <div :class="['app-wrapper', { 'dark': isDark }]">
    <el-config-provider :locale="locale">
      <el-container class="app-container">
        <el-header height="60px" class="app-header-container">
          <HeaderComponent />
        </el-header>
        <el-container class="main-container">
          <el-aside width="auto" class="app-aside">
            <NavComponent />
          </el-aside>
          <el-main class="app-main">
            <router-view/>
          </el-main>
        </el-container>
      </el-container>
    </el-config-provider>
  </div>
</template>

<script setup>
import { ref, provide, computed, watch, onMounted } from 'vue'
import HeaderComponent from './components/Header.vue'
import NavComponent from './components/Nav.vue'

// Import Element Plus locales if needed or ignore for simplicity
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

// 从本地存储读取主题偏好
const savedTheme = localStorage.getItem('openlani-theme')
const isDark = ref(savedTheme === 'dark' ? true : false)
const isEn = ref(false)
const isNavCollapsed = ref(false)

// Translations
const messages = {
  zh: {
    darkModeToggle: '深色模式',
    lightModeToggle: '浅色模式',
    langToggle: 'English',
    modifyAccount: '修改账户信息',
    currentPassword: '当前密码',
    newPassword: '新密码',
    newUsername: '新用户名（可选）',
    cancel: '取消',
    saveChanges: '保存修改',
    optional: '可选',
    navChat: '对话',
    navConfig: '配置',
    navTask: '任务管理',
    navExtensions: '插件',
    navData: '数据',
    navConsole: '日志',
    collapseSidebar: '收起',
    expandSidebar: '展开',
    newChat: '新建对话',
    chatHistory: '对话历史',
    uploadFile: '上传文件',
    streamToggle: '开启流式响应',
    typeMessage: '输入消息...',
    send: '发送',
    voiceInput: '语音输入',
    modelConfig: '模型配置',
    addModel: '添加模型',
    provider: '供应商',
    modelName: '模型名称',
    apiBaseUrl: 'API Base URL',
    apiKeys: 'API Keys',
    modelType: '类型',
    textModel: '文字模型',
    imageModel: '生图模型',
    ttsModel: 'TTS',
    multimodalModel: '多模态',
    save: '保存',
    delete: '删除',
    edit: '编辑',
    confirmDeleteChat: '确认要删除这条对话吗？',
    confirmDeleteModel: '确认要删除这个模型配置吗？',
    warning: '提示',
    confirm: '确认',
    deleteSuccess: '删除成功'
  },
  en: {
    darkModeToggle: 'Dark Mode',
    lightModeToggle: 'Light Mode',
    langToggle: '中文',
    modifyAccount: 'Modify Account Info',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    newUsername: 'New Username (Optional)',
    cancel: 'Cancel',
    saveChanges: 'Save Changes',
    optional: 'Optional',
    navChat: 'Chat',
    navConfig: 'Config',
    navTask: 'OpenTask',
    navExtensions: 'Extensions',
    navData: 'Data',
    navConsole: 'Console',
    collapseSidebar: 'Collapse',
    expandSidebar: 'Expand',
    newChat: 'New Chat',
    chatHistory: 'Chat History',
    uploadFile: 'Upload File',
    streamToggle: 'Enable Streaming',
    typeMessage: 'Type a message...',
    send: 'Send',
    voiceInput: 'Voice Input',
    modelConfig: 'Model Config',
    addModel: 'Add Model',
    provider: 'Provider',
    modelName: 'Model Name',
    apiBaseUrl: 'API Base URL',
    apiKeys: 'API Keys',
    modelType: 'Type',
    textModel: 'Text Model',
    imageModel: 'Image Model',
    ttsModel: 'TTS',
    multimodalModel: 'Multimodal',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    confirmDeleteChat: 'Are you sure you want to delete this chat?',
    confirmDeleteModel: 'Are you sure you want to delete this model configuration?',
    warning: 'Warning',
    confirm: 'Confirm',
    deleteSuccess: 'Deleted successfully'
  }
}

const t = (key) => {
  const lang = isEn.value ? 'en' : 'zh'
  return messages[lang][key] || key
}

const locale = computed(() => (isEn.value ? en : zhCn))

const toggleNav = () => {
  isNavCollapsed.value = !isNavCollapsed.value
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  updateTheme()
}

const toggleLanguage = () => {
  isEn.value = !isEn.value
}

const updateTheme = () => {
  const html = document.documentElement
  if (isDark.value) {
    html.classList.add('dark')
    html.style.colorScheme = 'dark'
    localStorage.setItem('openlani-theme', 'dark')
  } else {
    html.classList.remove('dark')
    html.style.colorScheme = 'light'
    localStorage.setItem('openlani-theme', 'light')
  }
}

onMounted(() => {
  updateTheme()
})

// 监听主题变化
watch(isDark, () => {
  updateTheme()
})

provide('isDark', isDark)
provide('isEn', isEn)
provide('isNavCollapsed', isNavCollapsed)
provide('t', t)
provide('toggleNav', toggleNav)
provide('toggleTheme', toggleTheme)
provide('toggleLanguage', toggleLanguage)
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}
body {
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
#app {
  height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'PingFang SC', 'Microsoft YaHei', 'Source Han Sans SC', 'Noto Sans CJK SC', 'WenQuanYi Micro Hei', sans-serif;
  color: var(--el-text-color-primary);
  background-color: var(--el-bg-color);
}
.app-wrapper, .app-container {
  height: 100%;
  background-color: var(--el-bg-color);
}
.app-header-container {
  padding: 0;
}
.main-container {
  height: calc(100vh - 60px);
}
.app-main {
  padding: 0;
  background-color: var(--el-bg-color-page);
}

/* Light mode (default) */
:root {
  --el-bg-color: #ffffff;
  --el-bg-color-page: #f5f7fa;
  --el-text-color-primary: #303133;
  --el-text-color-secondary: #606266;
  --el-text-color-disabled: #909399;
  --el-text-color-placeholder: #a8abb2;
  --el-border-color: #dcdfe6;
  --el-border-color-light: #ebeef5;
  --el-fill-color-light: #f5f7fa;
  --el-fill-color-lighter: #fafafb;
  --el-color-primary: #409eff;
  --el-color-primary-light-9: #f0f9ff;
  --el-menu-border-color: #e4e7eb;
}

/* Dark mode */
html.dark {
  background-color: #0f0f0f;
  color: #e5eaf3;
  /* 背景和前景色 */
  --el-bg-color: #1a1a1a;
  --el-bg-color-page: #0f0f0f;
  --el-text-color-primary: #e5eaf3;
  --el-text-color-secondary: #b0b6be;
  --el-text-color-disabled: #8a8d97;
  --el-text-color-placeholder: #6c6e78;
  
  /* 边框和填充 */
  --el-border-color: #464648;
  --el-border-color-light: #2b2d30;
  --el-fill-color-light: #262626;
  --el-fill-color-lighter: #2b2d30;
  
  /* 主要颜色 */
  --el-color-primary: #409eff;
  --el-color-primary-light-9: #0c2340;
  
  /* 菜单 */
  --el-menu-border-color: #464648;
  --el-menu-bg-color: #141414;
  --el-menu-text-color: #b0b6be;
  --el-menu-active-color: #409eff;
  
  /* 对话框和弹窗 */
  --el-dialog-bg-color: #1a1a1a;
  --el-overlay-color-lighter: rgba(0, 0, 0, 0.7);
  --el-overlay-color: rgba(0, 0, 0, 0.9);
  
  /* 输入框和表单 */
  --el-input-bg-color: #262626;
  --el-input-border-color: #464648;
  --el-input-text-color: #e5eaf3;
  --el-input-placeholder-color: #6c6e78;
  --el-input-hover-border-color: #5a5c5f;
  --el-input-focus-border-color: #409eff;
  
  /* 表格 */
  --el-table-bg-color: #1a1a1a;
  --el-table-tr-bg-color: #1a1a1a;
  --el-table-tr-hover-bg-color: #262626;
  --el-table-text-color: #e5eaf3;
  --el-table-header-bg-color: #0f0f0f;
  --el-table-header-text-color: #b0b6be;
  --el-table-border-color: #464648;
  
  /* 下拉框和选择 */
  --el-select-input-focus-border-color: #409eff;
  --el-select-option-hover-bg-color: #262626;
  --el-select-option-text-color: #e5eaf3;
  
  /* 按钮 */
  --el-button-bg-color: #262626;
  --el-button-border-color: #464648;
  --el-button-text-color: #e5eaf3;
  --el-button-hover-bg-color: #2f2f2f;
  --el-button-hover-border-color: #5a5c5f;
  
  /* 消息/提示 */
  --el-message-bg-color: #1a1a1a;
  --el-message-border-color: #464648;
  --el-message-text-color: #e5eaf3;
}
</style>

<style>
/* 全局暗黑模式样式覆盖 */

/* 对话框 */
html.dark .el-dialog {
  background-color: #1a1a1a;
}

html.dark .el-dialog__header {
  border-bottom-color: #464648;
}

html.dark .el-dialog__title {
  color: #e5eaf3;
}

html.dark .el-dialog__close {
  color: #b0b6be;
}

/* 弹出层遮罩 */
html.dark .el-overlay {
  background-color: rgba(0, 0, 0, 0.7);
}

/* 输入框 */
html.dark .el-input__wrapper {
  background-color: #262626;
  border-color: #464648;
}

html.dark .el-input__inner {
  background-color: #262626;
  color: #e5eaf3;
}

html.dark .el-input__inner::placeholder {
  color: #6c6e78;
}

html.dark .el-input__wrapper:hover {
  border-color: #5a5c5f;
}

html.dark .el-input__wrapper.is-focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 表格 */
html.dark .el-table {
  background-color: #1a1a1a;
  color: #e5eaf3;
}

html.dark .el-table__header {
  background-color: #0f0f0f;
}

html.dark .el-table__header th {
  background-color: #0f0f0f;
  border-bottom-color: #464648;
  color: #b0b6be;
}

html.dark .el-table__body tr {
  background-color: #1a1a1a;
  border-bottom-color: #464648;
}

html.dark .el-table__body tr:hover > td {
  background-color: #262626 !important;
}

html.dark .el-table__body td {
  border-bottom-color: #464648;
  color: #e5eaf3;
}

/* 选择框/下拉 */
html.dark .el-select-dropdown {
  background-color: #1a1a1a;
  border-color: #464648;
}

html.dark .el-select-dropdown__item {
  color: #e5eaf3;
}

html.dark .el-select-dropdown__item:hover {
  background-color: #262626;
}

html.dark .el-select-dropdown__item.selected {
  background-color: #0c2340;
  color: #409eff;
}

/* 表单项 */
html.dark .el-form-item__label {
  color: #e5eaf3;
}

html.dark .el-form-item__error {
  color: #f56c6c;
}

/* 按钮 */
html.dark .el-button {
  background-color: #262626;
  border-color: #464648;
  color: #e5eaf3;
}

html.dark .el-button:hover {
  background-color: #2f2f2f;
  border-color: #5a5c5f;
  color: #ffffff;
}

html.dark .el-button.is-active {
  background-color: #409eff;
  border-color: #409eff;
  color: #ffffff;
}

/* 消息框 */
html.dark .el-message-box {
  background-color: #1a1a1a;
  border-color: #464648;
}

html.dark .el-message-box__header {
  color: #e5eaf3;
}

html.dark .el-message-box__content {
  color: #e5eaf3;
}

/* 通知 */
html.dark .el-notification {
  background-color: #1a1a1a;
  border-color: #464648;
}

html.dark .el-notification__title {
  color: #e5eaf3;
}

/* 滚动条 */
html.dark ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

html.dark ::-webkit-scrollbar-track {
  background-color: transparent;
}

html.dark ::-webkit-scrollbar-thumb {
  background-color: #464648;
  border-radius: 4px;
}

html.dark ::-webkit-scrollbar-thumb:hover {
  background-color: #5a5c5f;
}

/* 下拉菜单 */
html.dark .el-dropdown-menu {
  background-color: #1a1a1a;
  border: 1px solid #464648;
}

html.dark .el-dropdown-menu__item {
  color: #e5eaf3;
}

html.dark .el-dropdown-menu__item:hover {
  background-color: #262626;
  color: #ffffff;
}

/* 弹出菜单 */
html.dark .el-popper {
  background-color: #1a1a1a;
  border: 1px solid #464648;
  color: #e5eaf3;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.5);
}

html.dark .el-popper[role="tooltip"] {
  background-color: #2b2d30;
  border-color: #464648;
}

html.dark .el-popper.is-dark {
  background-color: #1a1a1a;
  color: #e5eaf3;
}

html.dark .el-popper .popper__arrow::before {
  border-bottom-color: #1a1a1a;
}

/* 开关 */
html.dark .el-switch {
  background-color: #464648;
}

html.dark .el-switch.is-checked {
  background-color: #409eff;
}

html.dark .el-switch__core {
  background-color: #464648;
}

html.dark .el-switch.is-checked .el-switch__core {
  background-color: #409eff;
}

/* 选择框标签 */
html.dark .el-select-dropdown__item {
  color: #e5eaf3;
  background-color: #1a1a1a;
}

html.dark .el-select-dropdown__item:hover {
  background-color: #262626;
}

html.dark .el-select-dropdown__item.selected {
  background-color: #0c2340;
  color: #409eff;
  font-weight: bold;
}

/* 搜索框 */
html.dark .el-input__inner {
  caret-color: #409eff;
}
</style>

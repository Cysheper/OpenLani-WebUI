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

const isDark = ref(false)
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
    navChat: '对话 (Chat)',
    navConfig: '配置 (Config)',
    navTask: '任务管理 (OpenTask)',
    navExtensions: '插件 (Extensions)',
    navData: '数据 (Data)',
    navConsole: '日志 (Console)',
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
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

onMounted(() => {
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
#app {
  height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
.app-wrapper, .app-container {
  height: 100%;
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

/* Dark mode basic variables if Element Plus doesn't fully handle it */
html.dark {
  --el-bg-color: #141414;
  --el-bg-color-page: #0a0a0a;
  --el-text-color-primary: #E5EAF3;
}
</style>

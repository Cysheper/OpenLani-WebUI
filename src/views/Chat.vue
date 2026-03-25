<template>
  <div class="chat-wrapper">
    <!-- Chat Sidebar -->
    <div :class="['chat-sidebar', { 'collapsed': isSidebarCollapsed }]">
      <div class="sidebar-top">
        <el-button link @click="isSidebarCollapsed = !isSidebarCollapsed">
          <el-icon :size="16">
            <template v-if="!isSidebarCollapsed"><ArrowLeft /></template>
            <template v-else><ArrowRight /></template>
          </el-icon>
        </el-button>
      </div>
      
      <div class="sidebar-content" v-show="!isSidebarCollapsed">
        <el-button type="primary" class="new-chat-btn" @click="startNewChat">
          <el-icon><Plus />&nbsp;</el-icon> {{ t('newChat') }}
        </el-button>
        
        <div class="history-list">
          <div class="history-title">{{ t('chatHistory') }}</div>
          <el-scrollbar>
            <div 
              v-for="chat in chatHistory" 
              :key="chat.id" 
              class="history-item"
              :class="{ 'active': activeChatId === chat.id }"
              @click="selectChat(chat.id)"
            >
              <span class="chat-title">{{ chat.title }}</span>
              <el-button 
                class="delete-btn" 
                link 
                type="danger" 
                @click.stop="deleteChat(chat.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </div>

    <!-- Chat Main Content -->
  <div class="chat-main" ref="chatMainRef">
      <el-scrollbar class="chat-messages" ref="scrollbarRef">
        <div v-for="msg in currentMessages" :key="msg.id" :class="['message-box', msg.role]">
          <div class="message-wrapper">
            <div class="message-content" :class="`message-${msg.role}`">
              <div v-if="msg.role === 'ai'" class="model-name">{{ msg.model }}</div>
              <div v-if="msg.role === 'ai'" class="markdown-body markdown-ai" v-html="renderMarkdown(msg.text)"></div>
              <div v-else class="text chat-user-text">{{ msg.text }}</div>
            </div>
            <div class="time">{{ formatTime(msg.time) }}</div>
          </div>
        </div>
      </el-scrollbar>

      <!-- Chat Input Area -->
      <div class="chat-input-area">
        <textarea
          class="chat-input-textarea"
          v-model="inputText"
          rows="3"
          :placeholder="t('typeMessage')"
          @keydown.enter.prevent="sendMessage"
        ></textarea>
        <div class="input-actions">
          <div class="actions-left">
            <div class="chat-plus-menu" @click.stop>
              <button
                type="button"
                class="chat-action-btn chat-action-btn--plus"
                @click="togglePlusMenu"
              >
                <el-icon><Plus /></el-icon>
              </button>
              <div v-if="isPlusMenuOpen" class="chat-dropdown">
                <button type="button" class="chat-dropdown-item">
                  <el-icon><Document /></el-icon>
                  <span>{{ t('uploadFile') }}</span>
                </button>
                <label class="chat-dropdown-item chat-switch">
                  <input type="checkbox" v-model="useStream" />
                  <span class="chat-switch-slider"></span>
                  <span class="chat-switch-label">{{ t('streamToggle') }}</span>
                </label>
              </div>
            </div>

            <div class="chat-model-select" @click.stop>
              <button
                type="button"
                class="chat-model-button"
                @click="toggleModelMenu"
              >
                <span>{{ selectedModelLabel }}</span>
                <span class="chat-model-caret">▾</span>
              </button>
              <div v-if="isModelMenuOpen" class="chat-dropdown chat-model-dropdown">
                <button
                  v-for="model in availableModels"
                  :key="model.id"
                  type="button"
                  class="chat-dropdown-item"
                  :class="{ 'is-active': model.id === selectedModel }"
                  @click="selectModel(model.id)"
                >
                  {{ model.provider }}/{{ model.name }}
                </button>
              </div>
            </div>
          </div>

          <div class="actions-right">
            <button type="button" class="chat-action-btn">
              <el-icon><Microphone /></el-icon>
            </button>
            <button type="button" class="chat-action-btn chat-action-btn--primary" @click="sendMessage">
              <el-icon><Position /></el-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, ArrowRight, Plus, 
  Document, Microphone, Position, Delete 
} from '@element-plus/icons-vue'
import { request } from '../api'
import MarkdownIt from 'markdown-it'
import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-clike'
import 'prismjs/components/prism-c'
import 'prismjs/components/prism-cpp'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-csharp'
import 'prismjs/components/prism-go'
import 'prismjs/components/prism-rust'
import 'prismjs/components/prism-php'
import 'prismjs/components/prism-ruby'
import 'prismjs/components/prism-swift'
import 'prismjs/components/prism-kotlin'
import 'prismjs/components/prism-scala'
import 'prismjs/components/prism-dart'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
import 'prismjs/components/prism-docker'
import 'prismjs/components/prism-powershell'
import 'prismjs/components/prism-ini'
import 'prismjs/components/prism-lua'
import 'prismjs/components/prism-r'
import 'prismjs/components/prism-objectivec'
import 'prismjs/components/prism-perl'
import 'prismjs/components/prism-toml'
import 'prismjs/components/prism-markup-templating'

const t = inject('t')
const isSidebarCollapsed = ref(false)
const chatHistory = ref([])
const activeChatId = ref(null)
const currentMessages = ref([])
const inputText = ref('')
const selectedModel = ref('')
const availableModels = ref([])
const useStream = ref(true)
const isPlusMenuOpen = ref(false)
const isModelMenuOpen = ref(false)
const scrollbarRef = ref(null)
const chatMainRef = ref(null)
const copiedCodeId = ref('')
const isFirstMessage = ref(true) // 标记是否是新对话的第一条消息

const SIDE_GAP = '32px'
const BUBBLE_MAX_WIDTH = '960px'

const LANGUAGE_ALIASES = {
  js: 'javascript',
  jsx: 'jsx',
  ts: 'typescript',
  tsx: 'tsx',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  bash: 'bash',
  py: 'python',
  rb: 'ruby',
  rs: 'rust',
  golang: 'go',
  c: 'c',
  'c++': 'cpp',
  cpp: 'cpp',
  cxx: 'cpp',
  cs: 'csharp',
  'c#': 'csharp',
  ps: 'powershell',
  ps1: 'powershell',
  md: 'markdown',
  yml: 'yaml',
  dockerfile: 'docker',
  toml: 'toml'
}

// Display names for languages
const DISPLAY_NAMES = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  python: 'Python',
  java: 'Java',
  csharp: 'C#',
  go: 'Go',
  rust: 'Rust',
  cpp: 'C++',
  c: 'C',
  bash: 'Bash',
  shell: 'Shell',
  powershell: 'PowerShell',
  php: 'PHP',
  ruby: 'Ruby',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  dart: 'Dart',
  sql: 'SQL',
  yaml: 'YAML',
  markdown: 'Markdown',
  docker: 'Docker',
  ini: 'INI',
  lua: 'Lua',
  r: 'R',
  objectivec: 'Objective-C',
  perl: 'Perl',
  toml: 'TOML',
  json: 'JSON',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  markup: 'HTML',
  text: 'Text'
}

const md = new MarkdownIt({
  breaks: true,
  linkify: true,
  html: false,
  highlight(str, lang) {
    const rawLanguage = (lang || '').toLowerCase()
    const language = LANGUAGE_ALIASES[rawLanguage] || rawLanguage || 'text'
    const prismLanguage = Prism.languages[language] || Prism.languages.clike || Prism.languages.markup

    const highlighted = prismLanguage
      ? Prism.highlight(str, prismLanguage, language)
      : md.utils.escapeHtml(str)

    return highlighted
  }
})

// Override fence renderer to add header above code block
md.renderer.rules.fence = (tokens, idx, options, env, renderer) => {
  const token = tokens[idx]
  const lang = token.info.trim().toLowerCase()
  const language = LANGUAGE_ALIASES[lang] || lang || 'text'
  const displayLang = DISPLAY_NAMES[language] || language.charAt(0).toUpperCase() + language.slice(1)
  
  // Properly highlight the code content
  const prismLanguage = Prism.languages[language] || Prism.languages.clike || Prism.languages.markup
  const highlighted = prismLanguage
    ? Prism.highlight(token.content, prismLanguage, language)
    : md.utils.escapeHtml(token.content)

  return `<div class="code-header">
  <span class="code-lang">${displayLang}</span>
  <button class="code-copy-btn" type="button">复制</button>
</div>
<pre class="language-${language}"><code class="language-${language}">${highlighted}</code></pre>
`
}

const renderMarkdown = (text = '') => md.render(String(text))

const fetchModels = async () => {
  try {
    const res = await request('/models')
    if (res.status === 'success' && res.data) {
      availableModels.value = res.data
      if (res.data.length > 0) {
        selectedModel.value = res.data[0].id
      }
    }
  } catch (error) {
    // fallback to local storage if API fails during dev
    const models = JSON.parse(localStorage.getItem('openlani_models') || '[]')
    availableModels.value = models
    if (models.length > 0) {
      selectedModel.value = models[0].id
    }
  }
}

const selectedModelLabel = computed(() => {
  const model = availableModels.value.find(m => m.id === selectedModel.value)
  if (model) return `${model.provider}/${model.name}`
  return t('selectModel') || 'Select Model'
})

const togglePlusMenu = () => {
  isPlusMenuOpen.value = !isPlusMenuOpen.value
  if (isPlusMenuOpen.value) isModelMenuOpen.value = false
}

const toggleModelMenu = () => {
  isModelMenuOpen.value = !isModelMenuOpen.value
  if (isModelMenuOpen.value) isPlusMenuOpen.value = false
}

const selectModel = (modelId) => {
  selectedModel.value = modelId
  isModelMenuOpen.value = false
}

const handleDocumentClick = () => {
  isPlusMenuOpen.value = false
  isModelMenuOpen.value = false
}

const fetchHistory = async () => {
  try {
    const res = await request('/chat/history')
    if (res.status === 'success' && res.data) {
      chatHistory.value = res.data
    }
  } catch (error) {
    ElMessage.error(error.message || 'Failed to fetch chat history')
  }
}

const scrollToBottom = async () => {
  await nextTick()
  const wrap = scrollbarRef.value?.wrapRef
  if (wrap) {
    wrap.scrollTop = wrap.scrollHeight
  }
}

// 格式化时间戳为人性化的时间字符串
const formatTime = (inputDate) => {
  let date
  try {
    if (!inputDate) return ''
    if (typeof inputDate === 'string') {
      date = new Date(inputDate)
    } else {
      date = inputDate
    }
    
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      date = new Date()
    }
    
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return '刚刚'
    if (diffMins < 60) return `${diffMins}分钟前`
    
    // 如果是今天
    if (now.toDateString() === date.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    }
    
    // 如果是昨天
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    if (yesterday.toDateString() === date.toDateString()) {
      return `昨天 ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`
    }
    
    // 其他情况
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } catch (e) {
    return ''
  }
}

const startNewChat = async () => {
  try {
    const res = await request('/chat', { method: 'POST' })
    if (res.status === 'success' && res.data) {
      chatHistory.value.unshift(res.data)
      activeChatId.value = res.data.id
      currentMessages.value = []
      isFirstMessage.value = true // 新对话初始化为第一条
    }
  } catch (err) {
    ElMessage.error(err.message || 'Failed to create new chat')
    // Fallback for UI if no backend
    const newId = Date.now().toString()
    chatHistory.value.unshift({ id: newId, title: 'New Conversation' })
    activeChatId.value = newId
    currentMessages.value = []
    isFirstMessage.value = true // 新对话初始化为第一条
  }
}

const selectChat = async (id) => {
  activeChatId.value = id
  currentMessages.value = []
  isFirstMessage.value = false // 切换对话时重置标志
  try {
    const res = await request(`/chat/${id}/messages`)
    if (res.status === 'success' && res.data) {
      currentMessages.value = res.data
      // 如果是新对话且消息数 <= 2（用户1条+AI1条），标记为第一条
      if (res.data.length <= 2) {
        isFirstMessage.value = true
      }
    }
  } catch (error) {
    ElMessage.error(error.message || 'Failed to fetch messages')
  }
}

// 为新对话生成标题
const generateChatTitle = async (userText, aiText) => {
  if (!activeChatId.value) return false
  
  try {
    const res = await request(`/chat/${activeChatId.value}/title`, {
      method: 'POST',
      body: JSON.stringify({
        userText: userText.substring(0, 200), // 限制长度
        aiText: aiText.substring(0, 500)
      })
    })

    if (res.status === 'success' && res.data?.title) {
      // 更新本地历史记录
      const chatItem = chatHistory.value.find(c => c.id === activeChatId.value)
      if (chatItem) {
        chatItem.title = res.data.title
      }
      isFirstMessage.value = false // 标题生成后，标记已不是第一条
      return true
    }
  } catch (error) {
    console.error('Failed to generate chat title:', error)
  }
  return false
}

const deleteChat = (id) => {
  ElMessageBox.confirm(t('confirmDeleteChat'), t('warning'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning',
  })
    .then(async () => {
      try {
        await request(`/chat/${id}`, { method: 'DELETE' })
        chatHistory.value = chatHistory.value.filter(c => c.id !== id)
        if (activeChatId.value === id) {
          if (chatHistory.value.length > 0) {
            selectChat(chatHistory.value[0].id)
          } else {
            startNewChat()
          }
        }
        ElMessage.success(t('deleteSuccess'))
      } catch (err) {
        ElMessage.error(err.message || 'Delete failed')
      }
    })
    .catch(() => {})
}

const handleCopyButtonClick = async (event) => {
  const target = event.target.closest('.code-copy-btn')
  if (!target) return

  // Find the next <pre> element after the header
  let codeElem = null
  let current = target.closest('.code-header')
  while (current && !codeElem) {
    current = current.nextElementSibling
    if (current && current.tagName === 'PRE') {
      codeElem = current.querySelector('code')
      break
    }
  }

  if (!codeElem) {
    ElMessage.error('找不到代码内容')
    return
  }

  try {
    // Get plain text from code element
    let codeText = codeElem.textContent || ''
    
    // Decode common HTML entities that Prism may have added
    codeText = codeText
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
    
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(codeText)
      ElMessage.success('已复制代码')
    } else {
      // Fallback to older method for compatibility
      const textarea = document.createElement('textarea')
      textarea.value = codeText
      textarea.style.position = 'fixed'
      textarea.style.left = '-999999px'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      
      try {
        document.execCommand('copy')
        ElMessage.success('已复制代码')
      } catch (err) {
        ElMessage.error('复制失败，请手动复制')
      } finally {
        document.body.removeChild(textarea)
      }
    }
  } catch (error) {
    console.error('Copy error:', error)
    ElMessage.error('复制失败: ' + (error.message || '未知错误'))
  }
}

const sendMessage = async () => {
  if (!inputText.value.trim() || !selectedModel.value || !activeChatId.value) return

  const userText = inputText.value
  const userMsg = {
    id: Date.now().toString(),
    role: 'user',
    text: userText,
    time: new Date().toISOString()
  }
  currentMessages.value.push(userMsg)
  inputText.value = ''
  await scrollToBottom()
  
  const modelInfo = availableModels.value.find(m => m.id === selectedModel.value)
  const aiMsgId = (Date.now() + 1).toString()
  
  const aiMsg = {
    id: aiMsgId,
    role: 'ai',
    model: modelInfo ? `${modelInfo.provider}/${modelInfo.name}` : 'Unknown',
    text: '...',
    time: new Date().toISOString()
  }
  
  currentMessages.value.push(aiMsg)
  const aiIndex = currentMessages.value.length - 1
  await scrollToBottom()

  const requestBody = {
    text: userText,
    modelId: selectedModel.value,
    stream: useStream.value,
    isNewChat: isFirstMessage.value, // 告诉后端这是否是新对话
    attachments: [] // Add attachments if any
  }

  try {
    const res = await request(`/chat/${activeChatId.value}/messages`, {
      method: 'POST',
      headers: useStream.value ? { 'Accept': 'text/event-stream' } : { 'Accept': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (useStream.value) {
      if (!res.ok || !res.body) throw new Error('Stream request failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let responseText = ''

      currentMessages.value[aiIndex] = { ...currentMessages.value[aiIndex], text: '' }

      const commitAIText = async (text) => {
        currentMessages.value[aiIndex] = {
          ...currentMessages.value[aiIndex],
          text
        }
        await scrollToBottom()
      }

      // 解析 SSE 事件
      const parseSSEEvent = (chunk) => {
        const lines = chunk.split('\n')
        let event = 'message'
        let data = ''

        for (const line of lines) {
          if (line.startsWith('event:')) {
            event = line.slice(6).trim()
          }
          if (line.startsWith('data:')) {
            data += line.slice(5).trim()
          }
        }

        return { event, data }
      }

      let streamDone = false
      while (!streamDone) {
        const { value, done } = await reader.read()
        streamDone = done
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done })

        // 按空行分隔 SSE 事件
        const parts = buffer.split('\n\n')
        buffer = parts.pop() // 保留不完整的最后一段

        for (const chunk of parts) {
          if (!chunk.trim()) continue

          const { event, data } = parseSSEEvent(chunk)

          if (event === 'start') {
            // 流开始
            console.log('[SSE] Stream started')
          } else if (event === 'delta') {
            // 增量内容
            try {
              const payload = JSON.parse(data)
              const content = payload.content || payload.text || ''
              responseText += content
              await commitAIText(responseText)
            } catch (e) {
              console.error('Failed to parse delta event:', e)
            }
          } else if (event === 'end') {
            // 流结束
            try {
              const payload = JSON.parse(data)
              const finalText = payload.text || responseText
              responseText = finalText
              await commitAIText(responseText)
              streamDone = true
            } catch (e) {
              console.error('Failed to parse end event:', e)
            }
          } else if (event === 'error') {
            // 错误处理
            try {
              const payload = JSON.parse(data)
              console.error('[SSE] Error:', payload.message)
              ElMessage.error('流处理错误: ' + (payload.message || '未知错误'))
              streamDone = true
            } catch (e) {
              console.error('Failed to parse error event:', e)
            }
          }
        }
      }

      // 处理剩余的不完整数据
      if (buffer.trim()) {
        const { event, data } = parseSSEEvent(buffer)
        if (event === 'delta' && data) {
          try {
            const payload = JSON.parse(data)
            const content = payload.content || payload.text || ''
            responseText += content
            await commitAIText(responseText)
          } catch (e) {
            console.error('Failed to parse final delta:', e)
          }
        }
      }

      // 流式结束，生成标题（如果是新对话的第一条消息）
      if (isFirstMessage.value && userText && responseText) {
        setTimeout(() => {
          generateChatTitle(userText, responseText)
        }, 500)
      }
    } else {
      // Standard JSON response
      if (res.status === 'success' && res.data) {
        const responseText = res.data.text || ''
        currentMessages.value[aiIndex] = {
          ...currentMessages.value[aiIndex],
          text: responseText
        }
        await scrollToBottom()

        // 非流式结束，生成标题（如果是新对话的第一条消息）
        if (isFirstMessage.value && userText && responseText) {
          setTimeout(() => {
            generateChatTitle(userText, responseText)
          }, 500)
        }
      } else {
        throw new Error(res.message || 'Response error')
      }
    }
  } catch (error) {
    currentMessages.value[aiIndex] = {
      ...currentMessages.value[aiIndex],
      text: `Error: ${error.message}`
    }
    ElMessage.error('Failed to send message')
  }
}

onMounted(() => {
  fetchModels()
  fetchHistory().then(() => {
    if (chatHistory.value.length === 0) {
      startNewChat()
    } else {
      selectChat(chatHistory.value[0].id)
    }
  })
  chatMainRef.value?.addEventListener('click', handleCopyButtonClick)
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  chatMainRef.value?.removeEventListener('click', handleCopyButtonClick)
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
:global(:root) {
  --chat-side-gap: 32px;
  --chat-bubble-max-width: 960px;
}

.chat-wrapper {
  display: flex;
  height: 100%;
}
.chat-sidebar {
  width: 260px;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
  display: flex;
  flex-direction: column;
  transition: width 0.3s;
}
.chat-sidebar.collapsed {
  width: 40px;
}
.sidebar-top {
  padding: 10px;
  display: flex;
  justify-content: flex-end;
}
.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px;
}
.new-chat-btn {
  width: 100%;
  margin-bottom: 20px;
}
.history-list {
  flex: 1;
  overflow: hidden;
}
.history-title {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 10px;
}
.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 5px;
}
.chat-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}
.history-item:hover .delete-btn {
  opacity: 1;
}
.history-item:hover, .history-item.active {
  background-color: var(--el-fill-color-light);
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color-page);
}
.chat-messages {
  flex: 1;
  padding: 20px var(--chat-side-gap);
}
.message-box {
  display: flex;
  margin-bottom: 20px;
}
.message-box.user {
  justify-content: flex-end;
}
.message-content {
  padding: 12px 16px;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  font-size: 15px;
  line-height: 1.6;
  letter-spacing: 0.2px;
  word-break: break-word;
}
.message-content.message-user {
  width: fit-content;
  max-width: 100%;
}
.message-content.message-ai {
  width: fit-content;
  max-width: 100%;
}
.message-box.user .message-content {
  background-color: var(--el-color-primary-light-9);
}
.message-wrapper {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}
.message-box.user .message-wrapper {
  align-items: flex-end;
}
.message-box.ai .message-wrapper {
  align-items: flex-start;
}
.model-name {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--el-text-color-secondary);
}
.time {
  font-size: 12px;
  color: var(--el-text-color-disabled);
  margin-top: 4px;
  padding: 0 4px;
  letter-spacing: 0.3px;
  font-weight: 400;
}
.markdown-body :deep(p) {
  margin: 0 0 4px;
}
.markdown-body :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-body :deep(.code-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: #111827;
  border: 1px solid #1f2937;
  border-bottom: none;
  border-radius: 10px 10px 0 0;
  font-size: 12px;
  color: #8be9fd;
  margin-top: 8px;
}
.markdown-body :deep(.code-lang) {
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.markdown-body :deep(pre) {
  position: relative;
  white-space: pre;
  word-break: normal;
  padding: 12px 16px;
  margin: 0;
  border-radius: 0 0 10px 10px;
  background: #0b0d10;
  border: 1px solid #1f2937;
  border-top: none;
  overflow-x: auto;
  color: #e6edf3;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Microsoft YaHei Mono', 'SimHei', Menlo, Consolas, monospace;
  font-size: 15px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.markdown-body :deep(pre code) {
  display: block;
  background: transparent;
  font-family: inherit;
  color: inherit;
}
.markdown-body :deep(code) {
  padding: 0.2em 0.45em;
  border-radius: 6px;
  background: #111827;
  color: #e6edf3;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', 'Microsoft YaHei Mono', 'SimHei', Menlo, Consolas, monospace;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.markdown-body :deep(blockquote) {
  margin: 0;
  padding-left: 12px;
  border-left: 3px solid var(--el-border-color);
  color: var(--el-text-color-secondary);
}

.markdown-body :deep(.code-copy-btn) {
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid #374151;
  background: #111827;
  color: #e6edf3;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'JetBrains Mono', 'Fira Code', 'SFMono-Regular', Menlo, Consolas, monospace;
}
.markdown-body :deep(.code-copy-btn:hover) {
  background: #1f2937;
  border-color: #4b5563;
  transform: scale(1.05);
}
.markdown-body :deep(.code-copy-btn:active) {
  transform: scale(0.95);
}


.markdown-body :deep(.token.comment),
.markdown-body :deep(.token.prolog),
.markdown-body :deep(.token.doctype),
.markdown-body :deep(.token.cdata) {
  color: #7f849c;
}
.markdown-body :deep(.token.punctuation) {
  color: #e6edf3;
}
.markdown-body :deep(.token.property),
.markdown-body :deep(.token.tag),
.markdown-body :deep(.token.constant),
.markdown-body :deep(.token.symbol),
.markdown-body :deep(.token.deleted) {
  color: #ff7b72;
}
.markdown-body :deep(.token.boolean),
.markdown-body :deep(.token.number) {
  color: #f8a652;
}
.markdown-body :deep(.token.selector),
.markdown-body :deep(.token.attr-name),
.markdown-body :deep(.token.string),
.markdown-body :deep(.token.char),
.markdown-body :deep(.token.builtin),
.markdown-body :deep(.token.inserted) {
  color: #67e8f9;
}
.markdown-body :deep(.token.operator),
.markdown-body :deep(.token.entity),
.markdown-body :deep(.token.url),
.markdown-body :deep(.language-css .token.string),
.markdown-body :deep(.style .token.string) {
  color: #f8a652;
}
.markdown-body :deep(.token.atrule),
.markdown-body :deep(.token.attr-value),
.markdown-body :deep(.token.keyword) {
  color: #c586c0;
}
.markdown-body :deep(.token.function),
.markdown-body :deep(.token.class-name) {
  color: #8be9fd;
}
.markdown-body :deep(.token.regex),
.markdown-body :deep(.token.important),
.markdown-body :deep(.token.variable) {
  color: #ffcb6b;
}
.markdown-body :deep(.token.important),
.markdown-body :deep(.token.bold) {
  font-weight: 600;
}
.markdown-body :deep(.token.italic) {
  font-style: italic;
}
.markdown-body :deep(.token.entity) {
  cursor: help;
}

.chat-input-area {
  padding: 20px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
}
.chat-input-textarea {
  width: 100%;
  min-height: 90px;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  font-family: inherit;
  font-size: 15px;
  line-height: 1.6;
  resize: none;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.chat-input-textarea:focus {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
.chat-input-textarea::placeholder {
  color: var(--el-text-color-placeholder);
}
.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.actions-left, .actions-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.model-selector {
  width: 180px;
}
.chat-action-btn {
  border: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  transition: all 0.2s ease;
  height: 36px;
  width: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.chat-action-btn:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
.chat-action-btn--plus {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.chat-action-btn--primary {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: #ffffff;
}
.chat-action-btn--primary:hover {
  filter: brightness(1.05);
}
.chat-plus-menu,
.chat-model-select {
  position: relative;
}
.chat-dropdown {
  position: absolute;
  left: 0;
  bottom: 48px;
  min-width: 220px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.12);
  z-index: 30;
}
.chat-dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  text-align: left;
}
.chat-dropdown-item:hover {
  background-color: var(--el-fill-color-light);
}
.chat-dropdown-item.is-active {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.chat-model-button {
  height: 36px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid var(--el-border-color);
  background-color: var(--el-bg-color);
  color: var(--el-text-color-primary);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  min-width: 180px;
  justify-content: space-between;
}
.chat-model-button:hover {
  border-color: var(--el-color-primary);
}
.chat-model-caret {
  font-size: 12px;
  opacity: 0.7;
}
.chat-model-dropdown {
  left: 0;
  right: auto;
  max-height: 240px;
  overflow-y: auto;
}
.chat-switch {
  gap: 10px;
}
.chat-switch input {
  display: none;
}
.chat-switch-slider {
  width: 34px;
  height: 18px;
  border-radius: 999px;
  background-color: var(--el-border-color);
  position: relative;
  transition: background-color 0.2s ease;
}
.chat-switch-slider::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: #ffffff;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
}
.chat-switch input:checked + .chat-switch-slider {
  background-color: var(--el-color-primary);
}
.chat-switch input:checked + .chat-switch-slider::after {
  transform: translateX(16px);
}
.chat-switch-label {
  font-size: 12px;
}
.chat-model-select :deep(.el-input__wrapper) {
  background-color: var(--el-bg-color);
  border-color: var(--el-border-color);
  color: var(--el-text-color-primary);
}
.chat-model-select :deep(.el-input__inner) {
  color: var(--el-text-color-primary);
}
.chat-model-select :deep(.el-input__wrapper.is-focus) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
.chat-model-select :deep(.el-input__wrapper:hover) {
  border-color: var(--el-color-primary);
}

/* 暗黑模式下的消息气泡样式 */
:global(html.dark) .message-content {
  background-color: #262626 !important;
  border: 1px solid #464648;
  color: #e5eaf3 !important;
}

:global(html.dark) .message-content.message-ai {
  background-color: #262626 !important;
  color: #e5eaf3 !important;
}

:global(html.dark) .message-box.user .message-content {
  background-color: #409eff !important;
  border: 1px solid #409eff;
  color: #ffffff !important;
}

:global(html.dark) .message-wrapper .time {
  color: var(--el-text-color-secondary) !important;
}

:global(html.dark) .model-name {
  color: #b0b6be;
}

/* 暗黑模式下的输入框（绑定到 chat-input） */
:global(html.dark) .chat-input-textarea {
  background-color: #262626;
  color: #e5eaf3;
  border-color: #464648;
}

:global(html.dark) .chat-input-textarea::placeholder {
  color: #6c6e78;
}

:global(html.dark) .chat-input-textarea:hover {
  border-color: #5a5c5f;
}

:global(html.dark) .chat-input-textarea:focus {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 暗黑模式下的chat input区域 */
:global(html.dark) .chat-input-area {
  background-color: #1a1a1a;
  border-top-color: #464648;
}

:global(html.dark) .chat-action-btn {
  background-color: #262626;
  border-color: #464648;
  color: #e5eaf3;
}

:global(html.dark) .chat-action-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

:global(html.dark) .chat-action-btn--plus {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

:global(html.dark) .chat-action-btn--primary {
  background-color: #409eff;
  border-color: #409eff;
  color: #ffffff;
}

:global(html.dark) .chat-dropdown {
  background-color: #1a1a1a;
  border-color: #464648;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
}

:global(html.dark) .chat-dropdown-item {
  color: #e5eaf3;
}

:global(html.dark) .chat-dropdown-item:hover {
  background-color: #262626;
}

:global(html.dark) .chat-dropdown-item.is-active {
  background-color: #0c2340;
  color: #409eff;
}

:global(html.dark) .chat-model-button {
  background-color: #262626;
  border-color: #464648;
  color: #e5eaf3;
}

:global(html.dark) .chat-model-button:hover {
  border-color: #409eff;
}

:global(html.dark) .chat-switch-slider {
  background-color: #464648;
}

:global(html.dark) .chat-model-select :deep(.el-input__wrapper) {
  background-color: #262626;
  border-color: #464648;
  color: #e5eaf3;
}

:global(html.dark) .chat-model-select :deep(.el-input__inner) {
  color: #e5eaf3;
}

:global(html.dark) .chat-model-select :deep(.el-input__wrapper:hover) {
  border-color: #409eff;
}

:global(html.dark) .chat-model-select :deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 暗黑模式下的下拉菜单 */
:global(html.dark) .el-dropdown-menu {
  background-color: #1a1a1a;
  border-color: #464648;
}

:global(html.dark) .el-dropdown-menu__item {
  color: #e5eaf3;
}

:global(html.dark) .el-dropdown-menu__item:hover {
  background-color: #262626;
}

:global(html.dark) .el-dropdown-menu__item.is-disabled {
  color: #8a8d97;
}

/* 暗黑模式下的el-switch */
:global(html.dark) .el-switch {
  background-color: #464648;
}

:global(html.dark) .el-switch.is-checked {
  background-color: #409eff;
}

/* 暗黑模式下的模型选择框 */
:global(html.dark) .el-select {
  width: 100%;
}

:global(html.dark) .el-select__wrapper {
  background-color: #262626;
}

/* 暗黑模式下的弹出菜单 */
:global(html.dark) .el-popper {
  background-color: #1a1a1a;
  border-color: #464648;
  color: #e5eaf3;
}

:global(html.dark) .el-popper.is-dark {
  background-color: #1a1a1a;
}

:global(html.dark) .el-popper[role="tooltip"] {
  background-color: #2b2d30;
}
</style>
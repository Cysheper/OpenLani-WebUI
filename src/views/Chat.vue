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
          <el-icon><Plus /></el-icon> {{ t('newChat') }}
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
    <div class="chat-main">
      <el-scrollbar class="chat-messages" ref="scrollbarRef">
        <div v-for="msg in currentMessages" :key="msg.id" :class="['message-box', msg.role]">
          <div class="message-content">
            <div v-if="msg.role === 'ai'" class="model-name">{{ msg.model }}</div>
            <div class="text">{{ msg.text }}</div>
            <div class="time">{{ msg.time }}</div>
          </div>
        </div>
      </el-scrollbar>

      <!-- Chat Input Area -->
      <div class="chat-input-area">
        <el-input 
          v-model="inputText" 
          type="textarea" 
          :rows="3" 
          resize="none"
          :placeholder="t('typeMessage')"
          @keydown.enter.prevent="sendMessage"
        />
        <div class="input-actions">
          <div class="actions-left">
            <el-dropdown trigger="click" placement="top">
              <el-button circle>
                <el-icon><Plus /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <el-icon><Document /></el-icon> {{ t('uploadFile') }}
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-switch v-model="useStream" :active-text="t('streamToggle')" />
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-select v-model="selectedModel" class="model-selector" placeholder="Select Model">
              <el-option
                v-for="model in availableModels"
                :key="model.id"
                :label="`${model.provider}/${model.name}`"
                :value="model.id"
              />
            </el-select>
          </div>

          <div class="actions-right">
            <el-button circle>
              <el-icon><Microphone /></el-icon>
            </el-button>
            <el-button type="primary" @click="sendMessage">
              <el-icon><Position /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, ArrowRight, Plus, 
  Document, Microphone, Position, Delete 
} from '@element-plus/icons-vue'
import { request, API_BASE_URL } from '../api'

const t = inject('t')
const isSidebarCollapsed = ref(false)
const chatHistory = ref([])
const activeChatId = ref(null)
const currentMessages = ref([])
const inputText = ref('')
const selectedModel = ref('')
const availableModels = ref([])
const useStream = ref(true)

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

const startNewChat = async () => {
  try {
    const res = await request('/chat', { method: 'POST' })
    if (res.status === 'success' && res.data) {
      chatHistory.value.unshift(res.data)
      activeChatId.value = res.data.id
      currentMessages.value = []
    }
  } catch (err) {
    ElMessage.error(err.message || 'Failed to create new chat')
    // Fallback for UI if no backend
    const newId = Date.now().toString()
    chatHistory.value.unshift({ id: newId, title: 'New Conversation' })
    activeChatId.value = newId
    currentMessages.value = []
  }
}

const selectChat = async (id) => {
  activeChatId.value = id
  currentMessages.value = []
  try {
    const res = await request(`/chat/${id}/messages`)
    if (res.status === 'success' && res.data) {
      currentMessages.value = res.data
    }
  } catch (error) {
    ElMessage.error(error.message || 'Failed to fetch messages')
  }
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

const sendMessage = async () => {
  if (!inputText.value.trim() || !selectedModel.value || !activeChatId.value) return

  const userText = inputText.value
  const userMsg = {
    id: Date.now().toString(),
    role: 'user',
    text: userText,
    time: new Date().toLocaleTimeString()
  }
  currentMessages.value.push(userMsg)
  inputText.value = ''
  
  const modelInfo = availableModels.value.find(m => m.id === selectedModel.value)
  const aiMsgId = (Date.now() + 1).toString()
  
  const aiMsg = {
    id: aiMsgId,
    role: 'ai',
    model: modelInfo ? `${modelInfo.provider}/${modelInfo.name}` : 'Unknown',
    text: '...',
    time: new Date().toLocaleTimeString()
  }
  
  currentMessages.value.push(aiMsg)

  const requestBody = {
    text: userText,
    modelId: selectedModel.value,
    stream: useStream.value,
    attachments: [] // Add attachments if any
  }

  try {
    const res = await request(`/chat/${activeChatId.value}/messages`, {
      method: 'POST',
      headers: useStream.value ? { 'Accept': 'text/event-stream' } : { 'Accept': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (useStream.value) {
      if (!res.ok) throw new Error('Stream request failed')
      const reader = res.body.getReader()
      const decoder = new TextDecoder("utf-8")
      aiMsg.text = '' // clear the loading indicator

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        // Basic parsing of SSE data format 'data: chunk\n\n'
        const lines = chunk.split('\n')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6)
            if (dataStr === '[DONE]') break
            try {
              const parsed = JSON.parse(dataStr)
              aiMsg.text += parsed.delta || ''
            } catch (e) {
              // ignore parse errors for partial chunks
            }
          }
        }
      }
    } else {
      // Standard JSON response
      if (res.status === 'success' && res.data) {
        aiMsg.text = res.data.text
      } else {
        throw new Error(res.message || 'Response error')
      }
    }
  } catch (error) {
    aiMsg.text = `Error: ${error.message}`
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
})
</script>

<style scoped>
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
  padding: 20px;
}
.message-box {
  display: flex;
  margin-bottom: 20px;
}
.message-box.user {
  justify-content: flex-end;
}
.message-content {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: var(--el-bg-color);
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.05);
  position: relative;
}
.message-box.user .message-content {
  background-color: var(--el-color-primary-light-9);
}
.model-name {
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 5px;
  color: var(--el-text-color-secondary);
}
.time {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  margin-top: 5px;
  text-align: right;
}

.chat-input-area {
  padding: 20px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--el-border-color);
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
</style>
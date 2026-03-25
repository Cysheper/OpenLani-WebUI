<template>
  <div class="config-container">
    <div class="config-sidebar">
      <el-menu
        default-active="1"
        class="config-menu"
      >
        <el-menu-item index="1" @click="activeMenu = 'models'">
          <el-icon><Cpu /></el-icon>
          <template #title>{{ t('modelConfig') }}</template>
        </el-menu-item>
        <!-- other config menus can be added here -->
      </el-menu>
    </div>

    <div class="config-main">
      <div v-if="activeMenu === 'models'" class="model-config">
        <h2>{{ t('modelConfig') }}</h2>
        <el-button type="primary" @click="openAddModel">
          <el-icon><Plus /></el-icon> {{ t('addModel') }}
        </el-button>

        <el-table :data="models" style="width: 100%; margin-top: 20px" border>
          <el-table-column prop="provider" :label="t('provider')" width="150" />
          <el-table-column prop="name" :label="t('modelName')" width="200" />
          <el-table-column prop="type" :label="t('modelType')" width="150" />
          <el-table-column prop="apiBaseUrl" :label="t('apiBaseUrl')" />
          <el-table-column label="操作" width="150">
            <template #default="scope">
              <el-button size="small" @click="editModel(scope.row)">{{ t('edit') }}</el-button>
              <el-button size="small" type="danger" @click="deleteModel(scope.row)">{{ t('delete') }}</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-dialog v-model="addModelMode" :title="isEdit ? t('edit') : t('addModel')" width="500px">
          <el-form label-position="top">
            <el-form-item :label="t('provider')">
              <el-input v-model="newModel.provider" />
            </el-form-item>
            <el-form-item :label="t('modelName')">
              <el-input v-model="newModel.name" />
            </el-form-item>
            <el-form-item :label="t('apiBaseUrl')">
              <el-input v-model="newModel.apiBaseUrl" />
            </el-form-item>
            <el-form-item :label="t('apiKeys')">
              <el-input 
                v-model="newModel.apiKeysText" 
                type="textarea" 
                :rows="4" 
                placeholder="One key per line" 
              />
            </el-form-item>
            <el-form-item :label="t('modelType')">
              <el-select v-model="newModel.type" style="width: 100%">
                <el-option :label="t('textModel')" value="Text" />
                <el-option :label="t('imageModel')" value="Image" />
                <el-option :label="t('ttsModel')" value="TTS" />
                <el-option :label="t('multimodalModel')" value="Multimodal" />
              </el-select>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="addModelMode = false">{{ t('cancel') }}</el-button>
              <el-button type="primary" @click="saveModel">{{ t('save') }}</el-button>
            </span>
          </template>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Cpu, Plus } from '@element-plus/icons-vue'
import { request } from '../api'

const t = inject('t')
const activeMenu = ref('models')
const addModelMode = ref(false)
const isEdit = ref(false)
const editModelId = ref(null)

const models = ref([])

const newModel = ref({
  provider: '',
  name: '',
  apiBaseUrl: '',
  apiKeysText: '',
  type: 'Text'
})

const fetchModels = async () => {
  try {
    const res = await request('/models')
    if (res.status === 'success' && res.data) {
      models.value = res.data
      localStorage.setItem('openlani_models', JSON.stringify(models.value)) // also keep a local copy for Chat
    }
  } catch (error) {
    ElMessage.error(error.message || '获取模型配置失败')
    const saved = localStorage.getItem('openlani_models')
    if (saved) {
      models.value = JSON.parse(saved)
    }
  }
}

const openAddModel = () => {
  isEdit.value = false
  editModelId.value = null
  newModel.value = { provider: '', name: '', apiBaseUrl: '', apiKeysText: '', type: 'Text' }
  addModelMode.value = true
}

const editModel = (row) => {
  isEdit.value = true
  editModelId.value = row.id
  newModel.value = {
    provider: row.provider,
    name: row.name,
    apiBaseUrl: row.apiBaseUrl,
    apiKeysText: row.apiKeys ? row.apiKeys.join('\n') : '',
    type: row.type || 'Text'
  }
  addModelMode.value = true
}

const deleteModel = (row) => {
  ElMessageBox.confirm(t('confirmDeleteModel'), t('warning'), {
    confirmButtonText: t('confirm'),
    cancelButtonText: t('cancel'),
    type: 'warning',
  })
    .then(async () => {
      try {
        await request(`/models/${row.id}`, { method: 'DELETE' })
        models.value = models.value.filter(m => m.id !== row.id)
        localStorage.setItem('openlani_models', JSON.stringify(models.value))
        ElMessage.success(t('deleteSuccess'))
      } catch (err) {
        ElMessage.error(err.message || '删除失败')
      }
    })
    .catch(() => {})
}

const saveModel = async () => {
  const modelData = {
    provider: newModel.value.provider,
    name: newModel.value.name,
    apiBaseUrl: newModel.value.apiBaseUrl,
    apiKeys: newModel.value.apiKeysText.split('\n').filter(k => k.trim() !== ''),
    type: newModel.value.type
  }

  try {
    if (isEdit.value && editModelId.value) {
      // Edit existing model
      const res = await request(`/models/${editModelId.value}`, {
        method: 'PUT',
        body: JSON.stringify(modelData)
      })
      if (res.status === 'success') {
        const index = models.value.findIndex(m => m.id === editModelId.value)
        if (index !== -1) {
          models.value[index] = { ...modelData, id: editModelId.value }
        }
      }
    } else {
      // Add new model
      const res = await request('/models', {
        method: 'POST',
        body: JSON.stringify(modelData)
      })
      if (res.status === 'success' && res.data) {
        modelData.id = res.data.id
        models.value.push(modelData)
      }
    }
    
    localStorage.setItem('openlani_models', JSON.stringify(models.value))
    addModelMode.value = false
    newModel.value = { provider: '', name: '', apiBaseUrl: '', apiKeysText: '', type: 'Text' }
  } catch (err) {
    ElMessage.error(err.message || '保存失败')
  }
}

onMounted(() => {
  fetchModels()
})
</script>

<style scoped>
.config-container {
  display: flex;
  height: 100%;
}
.config-sidebar {
  width: 200px;
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color);
}
.config-menu {
  border-right: none;
}
.config-main {
  flex: 1;
  padding: 40px;
  background-color: var(--el-bg-color-page);
  overflow-y: auto;
}
h2 {
  margin-top: 0;
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}
</style>
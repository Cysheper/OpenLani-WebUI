<template>
  <div
    class="header-container"
    :style="{
      backgroundColor: isDark ? '#0f0f0f' : '#ffffff',
      borderBottomColor: isDark ? '#464648' : 'var(--el-border-color)'
    }"
  >
    <div class="left-section">
      <el-button
        link
        @click="toggleNav"
        class="hamburger-btn"
        :style="{ color: isDark ? '#ffffff' : '#1f1f1f' }"
      >
        <el-icon :size="20"><Menu /></el-icon>
      </el-button>
      <span
        class="brand-name"
        :style="{ color: isDark ? '#ffffff' : '#1f1f1f' }"
      >
        OpenLani
      </span>
    </div>
    <div class="right-section">
      <el-dropdown trigger="click" @command="handleCommand">
        <el-button
          link
          class="more-btn"
          :style="{ color: isDark ? '#ffffff' : '#1f1f1f' }"
        >
          <el-icon :size="20"><MoreFilled /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="theme">
              {{ themeToggleLabel }}
            </el-dropdown-item>
            <el-dropdown-item command="lang">
              {{ t('langToggle') }}
            </el-dropdown-item>
            <el-dropdown-item command="account">
              {{ t('modifyAccount') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- Modify Account Dialog -->
    <el-dialog v-model="accountDialogVisible" :title="t('modifyAccount')" width="400px">
      <div class="dialog-header">
        <h2 class="brand-name" style="margin: 0; padding-bottom: 20px;">OpenLani</h2>
      </div>
      <el-form label-position="top">
        <el-form-item :label="t('currentPassword')">
          <el-input type="password" v-model="accountForm.currentPassword" show-password />
        </el-form-item>
        <el-form-item :label="t('newPassword')">
          <el-input type="password" v-model="accountForm.newPassword" show-password />
        </el-form-item>
        <el-form-item :label="t('newUsername')">
          <el-input v-model="accountForm.newUsername" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="accountDialogVisible = false">{{ t('cancel') }}</el-button>
          <el-button type="primary" @click="saveAccount">{{ t('saveChanges') }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, inject, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Menu, MoreFilled } from '@element-plus/icons-vue'
import { request } from '../api'

const toggleNav = inject('toggleNav')
const t = inject('t')
const toggleTheme = inject('toggleTheme')
const toggleLanguage = inject('toggleLanguage')
const isDark = inject('isDark')

const themeToggleLabel = computed(() => (isDark?.value ? t('lightModeToggle') : t('darkModeToggle')))

const accountDialogVisible = ref(false)
const accountForm = ref({
  currentPassword: '',
  newPassword: '',
  newUsername: ''
})

const handleCommand = (command) => {
  if (command === 'theme') toggleTheme()
  if (command === 'lang') toggleLanguage()
  if (command === 'account') accountDialogVisible.value = true
}

const saveAccount = async () => {
  try {
    const response = await request('/account/update', {
      method: 'POST',
      body: JSON.stringify(accountForm.value)
    })
    if (response.status === 'success') {
      ElMessage.success(response.message || 'Updated successfully')
      accountDialogVisible.value = false
      accountForm.value = { currentPassword: '', newPassword: '', newUsername: '' }
    } else {
      ElMessage.error(response.message || 'Update failed')
    }
  } catch (error) {
    ElMessage.error(error.message || 'An error occurred during update')
  }
}
</script>

<style scoped>
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  padding: 0 20px;
  background-color: #ffffff;
  border-bottom: 1px solid var(--el-border-color);
}
.left-section, .right-section {
  display: flex;
  align-items: center;
}
.brand-name {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  font-size: 20px;
  font-weight: 600;
  margin-left: 20px;
  color: #1f1f1f;
}
.hamburger-btn, .more-btn {
  color: #1f1f1f;
}
.dialog-header {
  text-align: center;
}
</style>
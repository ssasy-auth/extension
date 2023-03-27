<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useVaultStore, useNotificationStore } from '~/common/stores';

interface Prompt {
  id: string;
  label: string;
  description: string;
}

const router = useRouter();

const currentPassword: Prompt = {
  id: 'currentPassword',
  label: 'Current password',
  description: 'Enter your current vault password.'
};

const newPassword: Prompt = {
  id: 'newPassword',
  label: 'New password',
  description: 'Enter your new vault password.'
};

const newPasswordConfirm: Prompt = {
  id: 'newPasswordConfirm',
  label: 'Confirm new password',
  description: 'Confirm your new vault password.'
};

const error = ref<string | null>(null);

const form = reactive({
  [currentPassword.id]: '',
  [newPassword.id]: '',
  [newPasswordConfirm.id]: ''
});

const prompts = computed<Prompt[]>(() => {
  return [ currentPassword, newPassword, newPasswordConfirm ];
});

const isValidCurrentPassword = computed<boolean | null>(() => {
  if(_isEmpty(form[currentPassword.id])) {
    return null;
  }

  return form[currentPassword.id].length > 0;
});

const isValidNewPassword = computed<boolean | null>(() => {
  if(_isEmpty(form[newPassword.id])) {
    return null;
  }

  return form[newPassword.id].length >= 3;
});

const isValidNewPasswordConfirm = computed<boolean | null>(() => {
  if(_isEmpty(form[newPasswordConfirm.id])) {
    return null;
  }

  return form[newPasswordConfirm.id] === form[newPassword.id];
});

const isValidForm = computed<boolean>(() => {
  return isValidCurrentPassword.value === true && isValidNewPasswordConfirm.value === true;
});

function _isEmpty(string: any): boolean {
  if (string === undefined || string === null){
    return true;
  }

  if (typeof string === 'string' && string.trim().length === 0) {
    return true;
  }

  return false;
}

function mapPromptIdToComputed(id: string): any {
  if(id === currentPassword.id){
    return isValidCurrentPassword.value;
  }

  else if(id === newPassword.id){
    return isValidNewPassword.value;
  }

  else if(id === newPasswordConfirm.id){
    return isValidNewPasswordConfirm.value;
  }
}

/**
 * Updates the vault password using the current password and new password.
 */
async function updatePassword(){
  if(!isValidForm.value){
    return;
  }

  try {
    const vaultStore = useVaultStore();
    const privateKey = await vaultStore.unwrapKey(form[currentPassword.id]);

    // update the vault password
    const success = await vaultStore.wrapKey(privateKey, form[newPassword.id]);

    if(!success){
      error.value = 'Failed to update vault password.';
      return;
    }

    // redirect to the vault page
    router.push('/');
  } catch (err) {
    const notificationStore = useNotificationStore();
    error.value = (err as Error).message || 'Failed to update vault password.';
    notificationStore.error('Vault Settings', error.value)
  }
}

</script>

<template>
  <BasePage title="Changing vault password">
    <v-row justify="center">
      <v-col
        cols="11"
        md="6">
        <v-list>
          <v-list-item
            v-for="prompt in prompts"
            :key="prompt.id">
            <v-list-item-title class="text-bold">{{ prompt.label }}</v-list-item-title>
            {{ prompt.description }}
            
            <v-list-item-action class="px-2">
              <InputText
                v-model="form[prompt.id]"
                :label="prompt.label"
                type="password"
                :is-valid="mapPromptIdToComputed(prompt.id)"/>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-col>

      <v-divider class="border-opacity-0" />
      
      <v-col
        cols="auto"
        class="mt-2">
        <BaseBtn
          color="error"
          large
          :disabled="!isValidForm"
          @click="updatePassword">
          Change password
        </BaseBtn>
      </v-col>
      
      <v-divider
        v-if="error"
        class="border-opacity-0 mt-2" />
      <v-col
        v-if="error"
        cols="auto"
        class="mt-2">
        <BaseCard
          color="error"
          class="text-center">
          {{ error }}
        </BaseCard>
      </v-col>
    </v-row>
  </BasePage>
</template>
<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVaultStore, useKeyStore, useNotificationStore } from '~/stores';
import type { PrivateKey } from '@ssasy-auth/core';
import BasePage from '~/components/base/BasePage.vue';
import BaseBtn from '~/components/base/BaseBtn.vue';
import InputText from '~/components/base/InputText.vue';
import InfoCard from '~/components/cards/InfoCard.vue';
import KeyCard from '~/components/cards/KeyCard.vue';

const router = useRouter();
const keyStore = useKeyStore();
const vaultStore = useVaultStore();
const notificationStore = useNotificationStore();

const data = reactive({
  privateKey: undefined as PrivateKey | undefined
});

const form = reactive({
  password: undefined as string | undefined,
  password2: undefined as string | undefined
});

const isValidKey = computed(() => {
  return data.privateKey !== undefined;
});

/**
 * Returns true if the password is valid
 */
const isValidPassword = computed(() => {
  if(form.password === undefined) {
    return undefined;
  }

  return form.password.length > 0;
});

/**
 * Returns true if the confirmation password is valid
 */
const isValidPassword2 = computed(() => {
  if(form.password2 === undefined) {
    return undefined;
  }

  return form.password2 === form.password;
});

async function saveKey(){
  if(!data.privateKey){
    throw new Error('No key to save');
  }

  if( form.password === undefined || isValidPassword2.value === false){
    throw new Error('Invalid password');
  }
  
  try {
    const stored = await vaultStore.wrapKey(data.privateKey, form.password);

    if(!stored){
      throw new Error('Failed to save key');
    }
  } catch (error) {
    const message = (error as Error).message || 'Failed to save key';
    notificationStore.error('Setup Storage Flow', message, { toast: true });
  }
  
  notificationStore.notify('Setup Storage Flow', 'Key saved!', { toast: true });
  router.push('/?newUser=true');
}

onMounted(async () => {
  if(!keyStore.hasTemporaryKey){
    notificationStore.error('Setup Storage Flow', 'Temporary key is missing', { toast: true });
    router.push('/setup');
  }

  try {
    data.privateKey = keyStore.temporaryKey;
  } catch (error) {
    const message = (error as Error).message || 'Failed to setup key';
    notificationStore.error('Setup Storage Flow', message, { toast: true });
  }
});
</script>

<template>
  <base-page title="Setup Storage">
    <v-row justify="center">
      <v-col
        v-if="isValidKey"
        cols="10"
        md="6">
        <key-card
          :ssasy-key="data.privateKey!"
          :hide-info="true" />
      </v-col>
      <v-divider class="border-opacity-0" />
      <v-col
        cols="10"
        md="6">
        <info-card>
          <b>Encrypt your private key</b>
          <p>
            Enter a password to encrypt your private key. This password will be used to unlock your key when you want to use it.
          </p>
        </info-card>
      </v-col>
      <v-divider class="border-opacity-0" />
      <v-col
        cols="10"
        md="6">
        <input-text
          v-model="form.password"
          label="Password"
          type="password"
          :is-valid="isValidPassword" />
        <v-divider class="border-opacity-0" />
        <input-text
          v-model="form.password2"
          label="Re-enter password"
          type="password"
          :is-valid="isValidPassword2" />
      </v-col>
      <v-divider class="border-opacity-0" />
      <v-col
        cols="10"
        md="auto">
        <base-btn
          large
          color="success"
          :disabled="!isValidPassword2"
          @click="saveKey">Save</base-btn>
      </v-col>
    </v-row>
  </base-page>
</template>
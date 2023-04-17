<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { reactive, computed, ComputedRef } from 'vue';
import { useVaultStore, useNotificationStore } from '~/stores';
import BaseCard from '~/components/base/BaseCard.vue';
import BaseInput from '~/components/base/InputText.vue';
import type { ActionItem } from '~/components/base/BaseCard.vue';
import type { PrivateKey } from '@ssasy-auth/core';

const props = defineProps({
  registerMode: {
    type: Boolean,
    default: false
  },
  confirmationMode: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits([ 'input' ]);

const form = reactive({
  password: '',
  passwordConfirm: ''
});

const isValidPassword: ComputedRef<boolean | null> = computed(() => {
  if (_isEmptyString(form.password)) {
    return null;
  }

  return form.password.length > 0;
});

const isValidPasswordConfirmation: ComputedRef<boolean | null> = computed(() => {
  return form.password === form.passwordConfirm;
}
);

const registrationAction = computed<ActionItem>(() => {
  return {
    label: 'Register',
    color: 'success',
    disabled: !isValidPasswordConfirmation.value,
    action: () => _unwrapKey(form.password)
  };
});

const loginAction = computed<ActionItem>(() => {
  return {
    label: 'Login',
    color: 'success',
    disabled: !isValidPassword.value,
    action: () => _unwrapKey(form.password)
  };
});

const confirmAction = computed<ActionItem>(() => {
  return {
    label: 'Confirm Action',
    color: 'success',
    disabled: !isValidPassword.value,
    action: () => _unwrapKey(form.password)
  };
});

const actionBtn: ComputedRef<ActionItem> = computed(() => {
  if(props.registerMode) {
    return registrationAction.value;
  }

  else if (props.confirmationMode) {
    return confirmAction.value;
  }

  else {
    return loginAction.value;
  }
});

function handleEnterKey(){
  if (
    actionBtn.value.disabled ||
    actionBtn.value.loading ||
    actionBtn.value.action === undefined
  ) {
    return;
  }

  actionBtn.value.action();
}

function _isEmptyString(string: string): boolean {
  if (string === null || string === undefined) {
    return true;
  }

  return string.trim().length === 0;
}

async function _unwrapKey(password: string){
  const vaultStore = useVaultStore();
  const notificationStore = useNotificationStore();

  try {
    // unwrap key
    const privateKey: PrivateKey = await vaultStore.unwrapKey(password);

    // emit the key
    emits('input', privateKey);
  } catch (error) {
    const message = (error as Error).message || 'Invalid password';
    notificationStore.error('Authentication', message, { toast: true });
  }
}
</script>

<template>
  <base-card :outlined="false">
    <slot name="header"></slot>

    <base-input
      v-model="form.password"
      label="Password"
      type="password"
      class="my-2"/>

    <!-- register mode only -->
    <v-divider v-if="props.registerMode" />
    <base-input
      v-if="props.registerMode"
      v-model="form.passwordConfirm"
      label="Confirm Password"
      type="password"
      class="my-2"/>

    <v-card-actions class="my-2">
      <v-row justify="center">
        <v-col cols="auto">
          <base-btn
            :color="actionBtn.color"
            :hint="actionBtn.hint"
            :outlined="actionBtn.outlined"
            :loading="actionBtn.loading"
            :disabled="actionBtn.disabled"
            @click="actionBtn.action"
            v-on:keyup.enter="handleEnterKey">
            {{ actionBtn.label }}
          </base-btn >
        </v-col>
      </v-row>
    </v-card-actions>

    <slot name="footer"></slot>
  </base-card>
</template>

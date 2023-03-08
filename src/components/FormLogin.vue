<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { reactive, computed, ComputedRef } from 'vue';
import BaseCard from './Base/BaseCard.vue';
import BaseInput from '~/components/Base/InputText.vue';
import type { ActionItem } from './Base/BaseCard.vue';

const props = defineProps({
  registerMode: {
    type: Boolean,
    default: false
  }
});

const emits = defineEmits([ 'login', 'register' ]);

const form = reactive({
  password: '',
  passwordConfirm: ''
});

const isValidPassword: ComputedRef<boolean | null> = computed(() => {
  if (isEmptyString(form.password)) {
    return null;
  }

  return form.password.length > 0;
});

const isValidPasswordConfirmation: ComputedRef<boolean | null> = computed(() => {
  return form.password === form.passwordConfirm;
}
);

const formActions: ComputedRef<ActionItem[]> = computed(() => {
  const action: ActionItem = props.registerMode
    ? {
      label: 'Login',
      disabled: !isValidPassword.value,
      action: () => {
        emits('login', form.password);
      }
    }
    : {
      label: 'Confirm',
      disabled: !isValidPassword.value || !isValidPasswordConfirmation.value,
      action: () => {
        emits('register', form.password);
      }
    };

  return [ action ];
});

function isEmptyString(string: string): boolean {
  if (string === null || string === undefined) {
    return true;
  }

  return string.trim().length === 0;
}
</script>

<template>
  <base-card :actions="formActions">
    <base-input
      v-model="form.password"
      label="Password"
      type="password"/>

    <!-- register mode only -->
    <v-divider v-if="props.registerMode" />
    <base-input
      v-if="props.registerMode"
      v-model="form.passwordConfirm"
      label="Confirm Password"
      type="password"/>
  </base-card>
</template>

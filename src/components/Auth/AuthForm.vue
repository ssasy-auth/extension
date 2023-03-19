<!-- login user or redirect them to setup.vue -->
<script setup lang="ts">
import { reactive, computed, ComputedRef } from 'vue';
import BaseCard from '~/components/Base/BaseCard.vue';
import BaseInput from '~/components/Base/InputText.vue';
import type { ActionItem } from '~/components/Base/BaseCard.vue';

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
  const registrationBtn: ActionItem = {
    label: 'Register',
    disabled: !isValidPasswordConfirmation.value,
    action: () => {
      emits('input', form.password);
    }
  };

  const loginBtn: ActionItem = {
    label: 'Login',
    disabled: !isValidPassword.value,
    action: () => {
      emits('input', form.password);
    }
  };

  const confirmBtn: ActionItem = {
    label: 'Confirm Action',
    disabled: !isValidPassword.value,
    action: () => {
      emits('input', form.password);
    }
  };

  if(props.registerMode) {
    return [ registrationBtn ];
  }

  else if (props.confirmationMode) {
    return [ confirmBtn ];
  }

  else {
    return [ loginBtn ];
  }
});

function isEmptyString(string: string): boolean {
  if (string === null || string === undefined) {
    return true;
  }

  return string.trim().length === 0;
}
</script>

<template>
  <base-card
    :outlined="false"
    :actions="formActions"
    :action-centered="true">
    <div class="pa-1">
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
    </div>
  </base-card>
</template>

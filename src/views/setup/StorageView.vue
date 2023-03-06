<script setup lang="ts">
import BasePage from "@/components/Base/BasePage.vue";
import BaseBtn from "@/components/Base/BaseBtn.vue";
import BaseInput from "@/components/Base/BaseInput.vue";

import { reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useKeyStore, useVaultStore } from "@/store/VaultStore";
import { useNotificationStore } from "@/store/AppStore";
import type { PrivateKey } from "@/logic";

const router = useRouter();
const keyStore = useKeyStore();
const vaultStore = useVaultStore();
const notificationStore = useNotificationStore();

const data = reactive({
  key: undefined as PrivateKey | undefined,
  passphrase: undefined as string | undefined,
  passphraseConfirm: undefined as string | undefined
});

const isValidPassphrase = computed(() => {
  if (!data.passphrase) return null as unknown as boolean;
  return data.passphrase.length > 3;
});
const isValidPassphraseConfirmation = computed(() => {
  if (!data.passphraseConfirm) return null as unknown as boolean;
  return data.passphrase === data.passphraseConfirm;
});

async function saveKey() {
  if (!data.key || !data.passphrase) {
    return notificationStore.addError("Setup Flow", "Missing key or passphrase");
  }

  const saved = await vaultStore.storeKey(data.key, data.passphrase);

  if(!saved) {
    return notificationStore.addError("Setup Flow", "Failed to save key to storage");
  }

  keyStore.$reset();
  console.log("Saved key to storage");
}

// setup keys when page is loaded
onMounted(async () => {
  if (keyStore.temporaryKey === undefined) {
    notificationStore.addError("Setup Flow", "Cannot find temporary keys");
    router.push({ name: "setup-index" });
  } else {
    data.key = keyStore.temporaryKey as PrivateKey;
  }
});
</script>

<template>
  <base-page>
    <v-row v-if="data.key" justify="center">
      <v-col cols="auto">
        <h2>Setup password for your key</h2>
      </v-col>
      <v-col cols="11">
        <base-input v-model="data.passphrase" :is-valid="isValidPassphrase" type="password" label="Passphrase" />
      </v-col>
      <v-col cols="11">
        <base-input v-model="data.passphraseConfirm" :is-valid="isValidPassphraseConfirmation" type="password" label="Confirm Passphrase" />
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-col cols="auto">
        <base-btn :disabled="!isValidPassphrase || !isValidPassphraseConfirmation" @click="saveKey()">Confirm</base-btn>
      </v-col>
    </v-row>
  </base-page>
</template>

<style scoped>
.json-key {
  font-family: monospace;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
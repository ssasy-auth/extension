<script setup lang="ts">
import BasePage from "@/components/Base/BasePage.vue";
import BaseBtn from "@/components/Base/BaseBtn.vue";
import { reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useKeyStore } from "@/store/VaultStore";
import { useNotificationStore } from "@/store/AppStore";
import type { RawKey } from "@/logic";

const router = useRouter();
const keyStore = useKeyStore();
const notificationStore = useNotificationStore();

const data = reactive({
  rawKey: undefined as RawKey | undefined
});

// setup keys when page is loaded
onMounted(async () => {
  if (!keyStore.temporaryKey) {
    notificationStore.addError("Setup Flow", "Cannot find temporary keys");
    router.push({ name: "setup-index" });
  } else {
    console.log("Found temporary key", { key: keyStore.temporaryKey });
    data.rawKey = await keyStore.exportKey(keyStore.temporaryKey);
  }
  
});

const jsonKey = computed(() => {
  if (!data.rawKey) return "";
  return JSON.stringify(data.rawKey);
});

</script>

<template>
  <base-page>
    <v-row v-if="data.rawKey" justify="center">
      <v-col cols="auto">
        <h2>Back Up Your Key Now</h2>
      </v-col>
      <v-col cols="12"></v-col>
      <v-col cols="auto">
        <div class="json-key">
          {{ jsonKey }}
        </div>
      </v-col>
    </v-row>
    <v-row v-if="data.rawKey" justify="center">
      <v-col cols="auto">
        <base-btn @click="router.push({ name: 'setup-storage' })">Next</base-btn>
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
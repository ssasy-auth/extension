<script setup lang="ts">
import { reactive } from "vue";
import { useRouter } from "vue-router"
import BasePage from "@/components/Base/BasePage.vue";
import BaseBtn from "@/components/Base/BaseBtn.vue";
import { useKeyStore } from "@/store/VaultStore";
import type { PrivateKey, RawKey } from "@/logic";

const router = useRouter();
const keyStore = useKeyStore();

const data = reactive({
  key: undefined as PrivateKey | undefined,
  rawKey: undefined as RawKey | undefined
});

async function generateKey() {
  data.key = await keyStore.createKey();

  // push to next page
  router.push({ name: "setup-backup" });
}

</script>

<template>
  <base-page>
    <v-row justify="center">
      <v-col cols="auto">
        <h2>Generate key pair</h2>
      </v-col>
      <v-col cols="12"></v-col>
      <v-col cols="auto">
        <base-btn @click="generateKey()">Generate</base-btn>
      </v-col>
    </v-row>
  </base-page>
</template>

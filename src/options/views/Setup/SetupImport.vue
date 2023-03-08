<!-- generate key or import -->
<script setup lang="ts">
import { reactive, computed, toRaw } from 'vue';
import { KeyChecker } from '@this-oliver/ssasy';
import { useKeySmithStore } from '~/stores/key-store';
import { useNotificationStore } from '~/stores/app-store';
import BasePage from '~/components/Base/BasePage.vue';
import InputFile from '~/components/Base/InputFile.vue';
import InputTextArea from '~/components/Base/InputTextArea.vue';
import KeyViewer from '~/components/KeyViewer.vue';
import { KeyType } from '@this-oliver/ssasy';
import type { PrivateKey, RawKey } from '@this-oliver/ssasy';

const notificationStore = useNotificationStore();
const keySmithStore = useKeySmithStore();

const data = reactive({
  privateKey: undefined as PrivateKey | undefined
})

const form = reactive({
  files: undefined as File[] | undefined,
  text: undefined as string | undefined
});

const isValidKey = computed(() => {
  if(!data.privateKey){
    return false;
  }

  return KeyChecker.isKey(data.privateKey);
});

async function importKey(){
  try {
    if(form.files){
      console.log({ pre: form.files });
      data.privateKey = await convertFileToKey(toRaw(form.files));
    } else if(form.text){
      data.privateKey = await convertStringToKey(toRaw(form.text));
    } else {
      throw new Error('No key to import');
    }
  } catch (error) {
    const message = (error as Error).message || 'Failed to convert file to key';
    notificationStore.notify('Setup Import Flow', message, 500);
  }
}

/**
 * Converts a json file to a raw key
 */
async function convertFileToKey(f: File[]): Promise<PrivateKey> {
  console.log({ psot: f });
  const file = f[0] as File;

  if(!file){
    throw new Error('No file');
  }

  if(file.type !== 'application/json'){
    throw new Error('Not a json file');
  }

  // extract file contents
  const content = await file.text();

  // convert string to json
  const json = JSON.parse(content);

  // return if file is not a key
  if(!KeyChecker.isRawKey(json)){
    throw new Error('Not a raw key');
  }

  return json;
}

/**
 * Converts a string to a raw key
 */
async function convertStringToKey(string: string): Promise<PrivateKey>{
  if(typeof string !== 'string'){
    throw new Error('Not a string');
  }

  let rawKey: RawKey;
  try {
    rawKey = JSON.parse(string);
  } catch (error) {
    throw new Error('Not a valid json string');
  }

  if(!KeyChecker.isRawKey(rawKey)){
    throw new Error('Not a valid raw key');
  }

  if(rawKey.type !== KeyType.PrivateKey){
    throw new Error('Not a private key');
  }

  // convert raw key to private key
  return await keySmithStore.importKey(rawKey) as PrivateKey;
}
</script>

<template>
  <base-page title="Import Key">
    <v-row
      v-if="!isValidKey"
      justify="center"
      no-gutters>
      <v-col
        cols="10"
        md="6">
        <base-card>
          <v-card-text>
            <p>
              There are two ways to import a key. You can either copy/paste the key into the text area below,
              or you can upload a JSON file containing the key.
            </p>
          </v-card-text>
        </base-card>
      </v-col>
      <v-divider />
      <v-col
        cols="10"
        md="6"
        class="mt-2">
        <base-card
          class="my-1"
          :outlined="false">
          <input-text-area
            v-model="form.text"
            label="Paste Key" />
        </base-card>
        <div class="text-center">
          <i>or</i>
        </div>
        <base-card
          class="my-1"
          :outlined="false">
          <input-file
            v-model="form.files"
            label="Upload JSON File"/>
        </base-card>
      </v-col>
      <v-divider />
      <v-col cols="auto">
        <base-btn
          :disabled="!form.text && !form.files"
          @click="importKey">
          Import
        </base-btn>
      </v-col>
    </v-row>
    <v-row
      v-else
      justify="center">
      <v-col
        cols="10"
        md="6">
        <key-viewer
          :ssasy-key="data.privateKey!"
          :show-secrets="true" />
      </v-col>
    </v-row>
    <v-row
      v-if="isValidKey"
      justify="center">
      <v-col cols="auto">
        <base-btn to="/setup">
          Back
        </base-btn>
      </v-col>
      <v-col cols="auto">
        <base-btn to="/setup/storage">
          Next
        </base-btn>
      </v-col>
    </v-row>
  </base-page>
</template>

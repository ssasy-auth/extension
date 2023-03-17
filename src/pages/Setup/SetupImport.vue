<!-- generate key or import -->
<script setup lang="ts">
import { reactive, computed } from 'vue';
import { GenericKey, KeyChecker } from '@this-oliver/ssasy';
import { useKeyStore } from '~/stores/key-store';
import { useNotificationStore } from '~/stores/app';
import BasePage from '~/components/Base/BasePage.vue';
import InputFile from '~/components/Base/InputFile.vue';
import InputTextArea from '~/components/Base/InputTextArea.vue';
import KeyViewer from '~/components/Key/KeyViewer.vue';
import { KeyType } from '@this-oliver/ssasy';
import type { PrivateKey, RawKey } from '@this-oliver/ssasy';

const notificationStore = useNotificationStore();
const keyStore = useKeyStore();

const form = reactive({
  files: undefined as File[] | undefined,
  text: undefined as string | undefined
});

const data = reactive({
  rawKey: undefined as RawKey | undefined,
  privateKey: undefined as PrivateKey | undefined
})

/**
 * Returns true if the private key is valid
 */
const isValidKey = computed(() => {
  if(!data.privateKey){
    return false;
  }

  return KeyChecker.isKey(data.privateKey);
});

async function convertInputToKey(input: string | Blob[]): Promise<RawKey>{
  let key: RawKey;

  if(typeof input === 'string'){
    try {
    // convert string to raw key (json)
      key = JSON.parse(input);
    } catch (error) {
      throw new Error('Not a valid json string');
    }

  } else if ( Array.isArray(input) && input[0] instanceof Blob){
    const file = input[0] as File;

    // throw error if no file
    if(!file){
      throw new Error('No file');
    }

    // throw error if not a json file
    if(file.type !== 'application/json'){
      throw new Error('Not a json file');
    }

    // extract file contents
    const content = await file.text();

    // convert string content to raw key (json)
    key = JSON.parse(content);
  } else {
    throw new Error('Invalid input');
  }
  
  // throw error if not a raw key
  if(!KeyChecker.isRawKey(key as GenericKey)){
    throw new Error('Not a valid raw key');
  }

  // throw error if not a private key
  if(key.type !== KeyType.PrivateKey){
    throw new Error('Not a private key');
  }

  return key;
}

/**
 * Sets the raw key and private key
 */
async function importKey(){
  const input = form.files || form.text;

  if(input === undefined){
    throw new Error('Input is undefined');
  }

  try {
    // convert file or string to raw key
    const rawKey = await convertInputToKey(input);
    
    // set component raw key
    data.rawKey = rawKey;

    // convert raw key to private key
    const privateKey = await keyStore.importKey(rawKey) as PrivateKey;
    
    // set component private key
    data.privateKey = privateKey;

    // set key store temporary key
    keyStore.temporaryKey = privateKey;

  } catch (error) {
    const message = (error as Error).message || 'Failed to convert file to key';
    notificationStore.error('Setup Import Flow', message);
  }
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

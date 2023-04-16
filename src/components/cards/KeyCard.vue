<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { KeyChecker, KeyType, KeyModule, CryptoModule } from '@ssasy-auth/core';
import { useKeyStore } from '~/stores/key-store';
import type { PropType } from 'vue';
import type { GenericKey, RawKey } from '@ssasy-auth/core';
import type { ActionItem } from '~/components/base/BaseCard.vue';
import BaseCard from '~/components/base/BaseCard.vue';
import BaseBtn from '~/components/base/BaseBtn.vue';
import InputText from '~/components/base/InputText.vue';
import InfoCard from '~/components/cards/InfoCard.vue';
import InfoCardNeverShareKey from '~/components/cards/InfoCardNeverShareKey.vue';

const keyStore = useKeyStore();

const props = defineProps({
  ssasyKey: {
    type: Object as PropType<GenericKey | RawKey>,
    required: true
  },
  showSecrets: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: false
  },
  hideInfo: {
    type: Boolean,
    default: false
  }
});

const rawKey = ref<RawKey | undefined>(undefined);
const keySummary = ref<KeyDetail[]>([]);

const showExportForm = ref(false);
const exportPassword = ref('');
const exportPasswordConfirm = ref('');

const isSensitiveKey = computed<boolean>(() => {
  return props.ssasyKey.type !== KeyType.PublicKey;
});

const getKeyColor = computed<string>(() => {
  return isSensitiveKey.value ? 'red' : 'green';
});

const getKeyType = computed<string>(() => {
  const SYMMETRIC = 'Symmetric';
  const ASYMMETRIC = 'Asymmetric';

  switch (props.ssasyKey.type) {
  case KeyType.SecretKey:
    return SYMMETRIC;
  case KeyType.PassKey:
    return `Password-based ${SYMMETRIC}`;
  case KeyType.PrivateKey:
    return `Private ${ASYMMETRIC}`;
  case KeyType.PublicKey:
    return `Public ${ASYMMETRIC}`;
  case KeyType.SharedKey:
    return `Shared (ECDH) ${SYMMETRIC}`;
  default:
    return 'Unknown';
  }
});

const getKeyActions = computed<ActionItem[]>(() => {
  const actions: ActionItem[] = [
    {
      label: 'Encrypted Export',
      description:
				'(Recommended) Export the key in encrypted format using a password. Anyone with access to the file and the password can use the key.',
      disabled: rawKey.value === undefined,
      action: () => (showExportForm.value = true)
    },
    {
      label: 'Raw Export',
      description:
				'Export the key as a clear text. Anyone with access to the file can use the key. Use with caution.',
      disabled: rawKey.value === undefined,
      action: async () => await _exportKey(rawKey.value!)
    }
  ];

  return isSensitiveKey.value
    ? actions
    : actions.filter((action) => action.label !== 'Encrypted Export');
});

const isValidPassword = computed<boolean | null>(() => {
  if (_isEmptyString(exportPassword.value)) {
    return null;
  }

  return exportPassword.value.length > 0;
});

const isValidPasswordConfirmation = computed<boolean | null>(
  () => {
    return isValidPassword.value === true && exportPassword.value === exportPasswordConfirm.value;
  }
);

interface KeyDetail {
	label: string;
	value: string;
}
function _extractKeySummary(rawKey: RawKey): KeyDetail[] {
  const details: KeyDetail[] = [];
  const MSG_MISSING_VALUE = 'N/A';

  const isAsymmetric = rawKey.type === KeyType.PrivateKey || rawKey.type === KeyType.PublicKey;

  if(rawKey.crypto.kty || rawKey.crypto.crv || rawKey.crypto.alg) {
    details.push({
      label: 'Algorithm',
      value: isAsymmetric
        ? `${rawKey.crypto.kty} ${rawKey.crypto.crv}`
        : rawKey.crypto.alg || MSG_MISSING_VALUE
    });
  }
  
  if(rawKey.crypto.key_ops && rawKey.crypto.key_ops.length > 0){
    details.push({
      label: 'Usages',
      value: rawKey.crypto.key_ops?.join(', ') || MSG_MISSING_VALUE
    });
  }

  if(rawKey.domain){
    details.push({ label: 'Domain', value: rawKey.domain || MSG_MISSING_VALUE });
  }

  return details;
}

async function _exportKey(rawKey: RawKey, password?: string): Promise<void> {
  const jsonKey: string = JSON.stringify(rawKey);

  // create a json file
  let blob: Blob;

  if (password !== undefined) {
    const passKey = await KeyModule.generatePassKey({ passphrase: password });
    const encryptedKey = await CryptoModule.encrypt(passKey, jsonKey);

    blob = new Blob([ JSON.stringify(encryptedKey) ], {
      type: 'application/octet-stream'
    });
  } else {
    blob = new Blob([ jsonKey ], { type: 'application/json' });
  }

  // create link to download
  const url = URL.createObjectURL(blob);

  // create a download anchor node
  let downloadAnchorNode = document.createElement('a');
  // set the href to the blob url
  downloadAnchorNode.setAttribute('href', url);
  // set the download attribute to the file name
  downloadAnchorNode.setAttribute('download', password ? 'ssasy-encrypted-key.json' : 'ssasy-key.json');

  // trigger the download by appending the anchor node to the body
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();

  // close the blob
  URL.revokeObjectURL(url);

  // reset the form
  exportPassword.value = '';
  exportPasswordConfirm.value = '';

  // close the dialog
  showExportForm.value = false;
}

function _isEmptyString(string: string): boolean {
  if (string === null || string === undefined) {
    return true;
  }

  return string.trim().length === 0;
}

onMounted(async () => {
  rawKey.value = KeyChecker.isRawKey(props.ssasyKey)
    ? (props.ssasyKey as RawKey)
    : await keyStore.exportKey(props.ssasyKey);

  if (rawKey.value !== undefined) {
    keySummary.value = _extractKeySummary(rawKey.value);
  }
});
</script>

<template>
  <base-card class="pa-1">
    <v-card-title>{{ getKeyType }} Key</v-card-title>

    <v-card-text>
      <v-list
        lines="one"
        density="compact">
        <v-list-item
          v-for="detail in keySummary"
          :key="detail.label"
          :title="detail.label"
          :subtitle="detail.value"/>
      </v-list>

      <base-card
        v-if="props.showSecrets"
        tonal
        :color="getKeyColor"
        class="json-string mt-2">
        <pre><code>{{ rawKey }}</code></pre>
      </base-card>
    </v-card-text>
  </base-card>

  <info-card-never-share-key
    v-if="isSensitiveKey && !props.hideInfo"
    class="mt-2" />

  <div v-if="showExportForm">
    <info-card>
      <p>
        Enter your password to export your vault key.
      </p>
    </info-card>

    <base-card>
      <input-text
        v-model="exportPassword"
        label="Password"
        type="password" />
      <input-text
        v-model="exportPasswordConfirm"
        label="Confirm Password"
        type="password"/>
      <v-card-actions>
        <base-btn
          text
          large
          color="grey lighten-1"
          @click="showExportForm = false">
          Cancel
        </base-btn>
        <base-btn
          large
          :disabled="!isValidPasswordConfirmation"
          @click="_exportKey(rawKey!, exportPassword)">
          Export
        </base-btn>
      </v-card-actions>
    </base-card>
  </div>

  <v-row
    v-else-if="props.showActions"
    class="mt-2">
    <v-col
      v-for="action in getKeyActions"
      :key="action.label"
      cols="12">
      <v-row
        justify-md="space-between"
        align="center">
        <v-col
          cols="12"
          md="4">
          <base-btn
            large
            :color="action.color"
            :disabled="action.disabled"
            @click="action.action">
            {{ action.label }}
          </base-btn>
        </v-col>

        <v-col
          cols="12"
          md="7">
          <p class="text-grey lighten-1">
            {{ action.description }}
          </p>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<style>
.json-string {
	overflow: auto;
}
</style>

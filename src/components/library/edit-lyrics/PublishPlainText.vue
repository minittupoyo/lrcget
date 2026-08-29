<template>
  <BaseModal
    :click-to-close="!isPublishing"
    :esc-to-close="!isPublishing"
    :closeButton="!isPublishing"
    @close="emit('close')"
    content-class="max-w-screen-sm max-h-[60vh] flex flex-col"
  >
    <template #default>
      <div v-if="lintResult.length" class="grow flex flex-col h-full overflow-hidden">
        <div class="mb-4">{{ $t('publish.fixProblems') }}</div>

        <div class="grow overflow-y-scroll h-full">
          <table class="lint-result table">
            <thead class="text-xs font-bold">
              <tr>
                <th class="p-1 text-right">{{ $t('publish.line') }}</th>
                <th class="p-1 text-center">{{ $t('publish.severity') }}</th>
                <th class="p-1">{{ $t('publish.message') }}</th>
              </tr>
            </thead>
            <tbody class="text-xs">
              <tr v-for="(problem, index) in lintResult" :key="index">
                <td class="p-1 text-right">{{ problem.line }}</td>
                <td class="p-1 text-center">
                  <span v-if="problem.severity === 'error'" class="bg-red-200 text-red-800 font-bold text-xs px-1 py-0.5 rounded">{{ $t('publish.error') }}</span>
                </td>
                <td class="p-1">{{ problem.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="flex flex-col items-center">
        <div v-if="!isPublishing" class="mb-4">
          {{ $t('publish.confirmPlain', { track: `${title} - ${artistName}` }) }}
        </div>
        <div v-else class="mb-4">
          {{ $t('publish.publishingPlain', { track: `${title} - ${artistName}` }) }}
        </div>

        <table v-if="isPublishing" class="text-xs table-auto font-mono uppercase">
          <tbody>
            <tr>
              <td class="px-2 py-1">{{ $t('publish.requestChallenge') }}</td>
              <td class="text-right px-2 py-1">{{ progress.requestChallenge }}</td>
            </tr>

            <tr>
              <td class="px-2 py-1">{{ $t('publish.solveChallenge') }}</td>
              <td class="text-right px-2 py-1">{{ progress.solveChallenge }}</td>
            </tr>

            <tr>
              <td class="px-2 py-1">{{ $t('publish.publishPlainLyrics') }}</td>
              <td class="text-right px-2 py-1">{{ progress.publishLyrics }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <template #footer>
      <div v-if="lintResult.length" class="flex gap-2 justify-center w-full">
        <button class="button button-primary px-8 py-2 rounded-full" @click="emit('close')">{{ $t('publish.close') }}</button>
      </div>

      <div v-else-if="!isPublishing" class="flex gap-2 justify-center w-full">
        <button class="button button-primary px-8 py-2 rounded-full" @click="publishPlainText">{{ $t('publish.publishNow') }}</button>
        <button class="button button-normal px-8 py-2 rounded-full" @click="close">{{ $t('publish.cancel') }}</button>
      </div>

      <div v-else class="flex gap-2 justify-center w-full">
        <button class="button button-disabled px-8 py-2 rounded-full flex gap-3" disabled>
          <div class="animate-spin"><Loading /></div>
          <div>{{ $t('publish.publishing') }}</div>
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import { invoke } from '@tauri-apps/api/core'
import { ref, onMounted } from 'vue'
import { Loading } from 'mdue'
import { listen } from '@tauri-apps/api/event'
import { useToast } from 'vue-toastification'
import BaseModal from '@/components/common/BaseModal.vue'
import { t } from '@/i18n/index.js'

const toast = useToast()
const emit = defineEmits(['close'])
const props = defineProps({
  lintResult: {
    type: Array,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  albumName: {
    type: String,
    required: true
  },
  artistName: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  lyrics: {
    type: String,
    required: true
  }
})

const isPublishing = ref(false)
const isError = ref(false)
const progress = ref({
  requestChallenge: 'Pending',
  solveChallenge: 'Pending',
  publishLyrics: 'Pending'
})

const publishPlainText = async () => {
  isPublishing.value = true
  const plainLyrics = props.lyrics
  const syncedLyrics = ''
  try {
    await invoke('publish_lyrics', {
      title: props.title,
      albumName: props.albumName,
      artistName: props.artistName,
      duration: props.duration,
      plainLyrics,
      syncedLyrics
    })
    toast.success(t('publish.successPlain'))
  } catch (error) {
    isError.value = true
    console.error(error)
    toast.error(error)
  } finally {
    isPublishing.value = false
    close()
  }
}

onMounted(() => {
  listen('publish-lyrics-progress', (event) => {
    progress.value = event.payload
  })
})

const close = () => {
  if (!isPublishing.value) {
    emit('close')
  }
}
</script>

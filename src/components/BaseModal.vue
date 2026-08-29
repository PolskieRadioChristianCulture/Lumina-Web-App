<script setup lang="ts">
import { watch, onMounted, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    title?: string;
    icon?: string;
    maxWidth?: string;
  }>(),
  {
    title: "",
    icon: "",
    maxWidth: "540px"
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
}>();

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.modelValue) {
    close();
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
  }
);

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("keydown", handleKeydown);
  }
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleKeydown);
    document.body.style.overflow = "";
  }
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="modelValue" 
        class="lumina-modal-overlay" 
        @click.self="close"
        role="dialog"
        aria-modal="true"
      >
        <div 
          class="lumina-modal-dialog" 
          :style="{ maxWidth: maxWidth }"
        >
          <!-- Header -->
          <div class="modal-header">
            <div class="modal-title-wrapper">
              <span v-if="icon" class="modal-icon">{{ icon }}</span>
              <h3 v-if="title" class="modal-title">{{ title }}</h3>
              <slot name="header"></slot>
            </div>
            <button 
              type="button" 
              class="btn-modal-close" 
              @click="close"
              aria-label="Zamknij okno"
            >
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Body Content -->
          <div class="modal-body">
            <slot></slot>
          </div>

          <!-- Optional Footer Actions -->
          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.lumina-modal-overlay {
 position: fixed;
 inset: 0;
 z-index: 99999;
 background: rgba(5, 10, 24, 0.85);
 backdrop-filter: blur(12px);
 display: flex;
 align-items: center;
 justify-content: center;
 padding: 16px;
}

.lumina-modal-dialog {
 width: 100%;
 background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(11, 19, 43, 0.98));
 border: 1px solid var(--cc-border-gold, rgba(245, 158, 11, 0.35));
 border-radius: var(--cc-radius-lg, 20px);
 box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(245, 158, 11, 0.15);
 overflow: hidden;
 display: flex;
 flex-direction: column;
 max-height: 90vh;
}

.modal-header {
 padding: 18px 22px;
 border-bottom: 1px solid rgba(255, 255, 255, 0.08);
 display: flex;
 align-items: center;
 justify-content: space-between;
 gap: 12px;
}

.modal-title-wrapper {
 display: flex;
 align-items: center;
 gap: 10px;
}

.modal-icon {
 font-size: 1.3rem;
}

.modal-title {
 margin: 0;
 font-family: var(--cc-font-heading, Outfit, sans-serif);
 font-size: 1.2rem;
 font-weight: 800;
 color: var(--cc-text-primary, #ffffff);
}

.btn-modal-close {
 width: 34px;
 height: 34px;
 border-radius: 50%;
 background: rgba(255, 255, 255, 0.08);
 border: 1px solid rgba(255, 255, 255, 0.12);
 color: #cbd5e1;
 display: flex;
 align-items: center;
 justify-content: center;
 cursor: pointer;
 transition: all 0.2s ease;
}

.btn-modal-close:hover {
 background: rgba(239, 68, 68, 0.8);
 color: #ffffff;
 border-color: rgba(239, 68, 68, 0.9);
 transform: rotate(90deg);
}

.modal-body {
 padding: 20px 22px;
 overflow-y: auto;
 font-size: 0.92rem;
 color: #cbd5e1;
 line-height: 1.6;
}

.modal-footer {
 padding: 14px 22px;
 border-top: 1px solid rgba(255, 255, 255, 0.08);
 background: rgba(0, 0, 0, 0.25);
 display: flex;
 align-items: center;
 justify-content: flex-end;
 gap: 10px;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
 transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
 opacity: 0;
}

.modal-fade-enter-active .lumina-modal-dialog {
 transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-leave-active .lumina-modal-dialog {
 transition: transform 0.2s ease-in;
}

.modal-fade-enter-from .lumina-modal-dialog {
 transform: scale(0.92) translateY(12px);
}

.modal-fade-leave-to .lumina-modal-dialog {
 transform: scale(0.95);
}
</style>

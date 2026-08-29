<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "glass" | "gold" | "danger" | "ghost";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    disabled?: boolean;
    icon?: string;
    type?: "button" | "submit" | "reset";
  }>(),
  {
    variant: "primary",
    size: "md",
    loading: false,
    disabled: false,
    type: "button"
  }
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();
</script>

<template>
  <button
    :type="type"
    class="lumina-base-button"
    :class="[
      `btn-${variant}`,
      `btn-size-${size}`,
      { 'is-loading': loading, 'is-disabled': disabled }
    ]"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <!-- Spinner when loading -->
    <span v-if="loading" class="btn-spinner"></span>
    
    <!-- Optional leading icon -->
    <i v-if="icon && !loading" :class="icon" class="btn-icon"></i>
    
    <!-- Button Label slot -->
    <span class="btn-content">
      <slot></slot>
    </span>
  </button>
</template>

<style scoped>
.lumina-base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: var(--cc-font-heading, Outfit, sans-serif);
  font-weight: 800;
  border-radius: var(--cc-radius-md, 14px);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  white-space: nowrap;
  outline: none;
  user-select: none;
}

/* Sizes */
.btn-size-sm {
  padding: 6px 12px;
  font-size: 0.76rem;
  border-radius: 10px;
}
.btn-size-md {
  padding: 10px 18px;
  font-size: 0.88rem;
  border-radius: 14px;
}
.btn-size-lg {
  padding: 14px 26px;
  font-size: 1.02rem;
  border-radius: 18px;
}

/* Variants */
.btn-primary, .btn-gold {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #000000;
  border-color: #f59e0b;
  box-shadow: var(--cc-shadow-gold, 0 6px 20px rgba(245, 158, 11, 0.35));
}
.btn-primary:hover:not(:disabled), .btn-gold:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 26px rgba(245, 158, 11, 0.55);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(10px);
}
.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
}

.btn-glass {
  background: rgba(15, 23, 42, 0.65);
  color: #e2e8f0;
  border-color: var(--cc-border-glass, rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(12px);
}
.btn-glass:hover:not(:disabled) {
  background: rgba(30, 41, 59, 0.85);
  border-color: rgba(245, 158, 11, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35);
}

.btn-ghost {
  background: transparent;
  color: #94a3b8;
}
.btn-ghost:hover:not(:disabled) {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.06);
}

/* States */
.is-disabled, .lumina-base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

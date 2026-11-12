<template>
  <div 
    ref="containerRef" 
    class="virtual-scroller-container overflow-y-auto custom-scrollbar relative"
    :style="{ height: typeof containerHeight === 'number' ? `${containerHeight}px` : containerHeight }"
    @scroll.passive="onScroll"
  >
    <!-- Phantom spacer to set full scrollable height -->
    <div 
      class="virtual-scroller-phantom absolute left-0 top-0 right-0 pointer-events-none" 
      :style="{ height: `${totalHeight}px` }"
    ></div>

    <!-- Visible window of DOM nodes -->
    <div 
      class="virtual-scroller-content w-full"
      :style="{ transform: `translateY(${offsetY}px)` }"
    >
      <div 
        v-for="(item, idx) in visibleItems" 
        :key="getItemKey(item, startIndex + idx)"
        :style="{ height: `${itemHeight}px` }"
        class="virtual-item-wrapper"
      >
        <slot :item="item" :index="startIndex + idx"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  },
  itemHeight: {
    type: Number,
    required: true,
    default: 64
  },
  buffer: {
    type: Number,
    default: 5
  },
  containerHeight: {
    type: [Number, String],
    default: 480
  },
  keyField: {
    type: String,
    default: 'id'
  }
})

const containerRef = ref(null)
const scrollTop = ref(0)
const viewportHeight = ref(480)

const totalHeight = computed(() => {
  return props.items.length * props.itemHeight
})

const startIndex = computed(() => {
  const start = Math.floor(scrollTop.value / props.itemHeight) - props.buffer
  return Math.max(0, start)
})

const endIndex = computed(() => {
  const visibleCount = Math.ceil(viewportHeight.value / props.itemHeight)
  const end = Math.floor(scrollTop.value / props.itemHeight) + visibleCount + props.buffer
  return Math.min(props.items.length, end)
})

const visibleItems = computed(() => {
  return props.items.slice(startIndex.value, endIndex.value)
})

const offsetY = computed(() => {
  return startIndex.value * props.itemHeight
})

const onScroll = (e) => {
  scrollTop.value = e.target.scrollTop
}

const getItemKey = (item, index) => {
  if (item && props.keyField && item[props.keyField] !== undefined) {
    return item[props.keyField]
  }
  return index
}

let resizeObserver = null

onMounted(() => {
  if (containerRef.value) {
    viewportHeight.value = containerRef.value.clientHeight || 480
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          viewportHeight.value = entry.contentRect.height
        }
      })
      resizeObserver.observe(containerRef.value)
    }
  }
})

onUnmounted(() => {
  if (resizeObserver && containerRef.value) {
    resizeObserver.unobserve(containerRef.value)
    resizeObserver.disconnect()
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 9999px;
}
</style>

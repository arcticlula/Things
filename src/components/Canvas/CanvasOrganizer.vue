<template>
  <div class="canvas-div" :style="{ width: props.c_width + 'px', height: props.c_height + 'px' }">
    <canvas :style="canSelect ? 'cursor: pointer;' : ''" ref="canvas" :width="organizerWidth" :height="organizerHeight"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

import { IDrawOrganizer } from '../../models/storage.model';

const props = defineProps<{
  c_width: number;
  c_height: number;
  canSelect?: boolean;
  storage?: IDrawOrganizer | null;
  selectedId?: string | null;
}>();

const emit = defineEmits(['selected']);

const organizerWidth = computed(() => props.c_width);
const organizerHeight = computed(() => props.c_height);

const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);

const drawnOrganizer = ref<IDrawOrganizer | null>(null);

onMounted(() => {
  if (canvas.value) {
    context.value = canvas.value.getContext('2d');
    canvas.value.addEventListener('click', handleClick);
    draw();
  }
});

onUnmounted(() => {
  if (canvas.value) {
    canvas.value.removeEventListener('click', handleClick);
  }
});

watch(() => [props.storage, props.selectedId], () => {
  draw();
});

const draw = (org?: IDrawOrganizer) => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;
  
  // Ensure canvas dimensions match calculated dimensions
  if (canvas.value.width !== organizerWidth.value || canvas.value.height !== organizerHeight.value) {
      canvas.value.width = organizerWidth.value;
      canvas.value.height = organizerHeight.value;
  }
  
  requestAnimationFrame(() => {
    if (!canvas.value) return;
    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;
    
    const organizerToDraw = org || props.storage;
    
    if (!organizerToDraw) {
        return;
    }
    
    ctx.clearRect(0, 0, organizerWidth.value, organizerHeight.value);

    drawnOrganizer.value = organizerToDraw;
    const organizer = organizerToDraw;

    // Ensure slots exist
    const slotsToDraw = organizer.slots || [];

    const ratio = organizer.ratio || 1.0;
    
    // Calculate what the total width would be if we use the ratio
    const widthIfScaledByHeight = organizer.x_units * (organizerHeight.value / organizer.y_units) * ratio;
    
    let slotWidth, slotHeight;
    let totalDrawnWidth, totalDrawnHeight;
    
    // Choose the scaling that fits within the canvas
    if (widthIfScaledByHeight <= organizerWidth.value) {
      // Scale based on height - height is the limiting factor
      const baseUnit = organizerHeight.value / organizer.y_units;
      slotHeight = baseUnit;
      slotWidth = baseUnit * ratio;
      totalDrawnWidth = organizer.x_units * slotWidth;
      totalDrawnHeight = organizerHeight.value;
    } else {
      // Scale based on width - width is the limiting factor
      const baseUnit = organizerWidth.value / (organizer.x_units * ratio);
      slotHeight = baseUnit;
      slotWidth = baseUnit * ratio;
      totalDrawnWidth = organizerWidth.value;
      totalDrawnHeight = organizer.y_units * slotHeight;
    }
    
    // Center the drawing on the canvas
    const startX = (organizerWidth.value - totalDrawnWidth) / 2;
    const startY = (organizerHeight.value - totalDrawnHeight) / 2;

    // Material-specific settings
    const materialStyles = {
      'plastic': {
        frameColor: "#4A4A4A", // Dark grey for plastic frame
        slotFrameColor: "#B0B0B0", // Light grey for plastic slot
        slotFrameColorUnselected: "#243534",
        slotInnerColor: "rgba(255, 255, 255, 0.3)", // Clear plastic effect
        slotInnerColorUnselected: "rgba(255, 255, 255, 0.3)", 
        slotBorderColor: "#666666", // Slot border for plastic
        handleColor: "#333333", // Dark grey for plastic handle
      }
    };

    // Select the material styles based on the 'material' prop
    const material = organizer.material as 'plastic' ;
    const styles = materialStyles[material] || materialStyles['plastic'];

    // Draw the cabinet outer frame
    ctx.fillStyle = styles.frameColor;
    ctx.fillRect(startX, startY, totalDrawnWidth, totalDrawnHeight);

    // Draw each slot with the selected material style
    slotsToDraw.forEach((slot) => {
      const isSelected = props.selectedId === slot.id;

      const slotFrameColor = props.selectedId ? 
        (isSelected ? styles.slotFrameColor : styles.slotFrameColorUnselected) :
        styles.slotFrameColor;

      const slotInnerColor = props.selectedId ? 
        (isSelected ? styles.slotInnerColor : styles.slotInnerColorUnselected) :
        styles.slotInnerColor;
        
      const slotX = startX + slot.x_pos * slotWidth;
      const slotY = startY + slot.y_pos * slotHeight;
      const actualWidth = slot.x_units * slotWidth;
      const actualHeight = slot.y_units * slotHeight;

      // Draw the slot background (frame)
      ctx.fillStyle = slotFrameColor;
      
      // Organizer Style: Rounded corners, looking like bins
      const radius = 2; // Reduced radius for tighter fit
      ctx.beginPath();
      ctx.rect(slotX, slotY, actualWidth, actualHeight); 
      ctx.fill();

      ctx.fillStyle = slotInnerColor;
      ctx.beginPath();
      ctx.roundRect(slotX + 3, slotY + 3, actualWidth - 6, actualHeight - 6, radius);
      ctx.fill();

      // Border - create a new path for the border
      ctx.strokeStyle = styles.slotBorderColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(slotX + 3, slotY + 3, actualWidth - 6, actualHeight - 6, radius);
      ctx.stroke();
      
      // Draw the slot name with sticker
      if (slot.name) {
        ctx.font = "13px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const textWidth = ctx.measureText(slot.name).width;
        const stickerWidth = textWidth + 10;
        const stickerHeight = 16;

        const stickerX = slotX + (actualWidth - stickerWidth) / 2;
        const stickerY = slotY + (actualHeight - stickerHeight) / 2;

        // Draw sticker background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(stickerX, stickerY, stickerWidth, stickerHeight);

        // Draw text
        ctx.fillStyle = "#000000";
        ctx.fillText(slot.name, slotX + actualWidth / 2, slotY + actualHeight / 2);
      }
    });

    // Draw the organizer outline (after slots)
    ctx.strokeStyle = styles.frameColor;
    ctx.lineWidth = 3;
    
    const radius = 8;
    ctx.beginPath();
    ctx.roundRect(startX, startY, totalDrawnWidth, totalDrawnHeight, radius);
    ctx.stroke();
  });
};

const handleClick = (event: MouseEvent) => {
  if(props.canSelect === false || !drawnOrganizer.value) return;
  if (!canvas.value || !context.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const organizer = drawnOrganizer.value;
  
  // Calculate the same dimensions as in draw()
  const ratio = organizer.ratio || 1.0;
  const widthIfScaledByHeight = organizer.x_units * (organizerHeight.value / organizer.y_units) * ratio;
  
  let slotWidth, slotHeight;
  let totalDrawnWidth, totalDrawnHeight;
  
  if (widthIfScaledByHeight <= organizerWidth.value) {
    const baseUnit = organizerHeight.value / organizer.y_units;
    slotHeight = baseUnit;
    slotWidth = baseUnit * ratio;
    totalDrawnWidth = organizer.x_units * slotWidth;
    totalDrawnHeight = organizerHeight.value;
  } else {
    const baseUnit = organizerWidth.value / (organizer.x_units * ratio);
    slotHeight = baseUnit;
    slotWidth = baseUnit * ratio;
    totalDrawnWidth = organizerWidth.value;
    totalDrawnHeight = organizer.y_units * slotHeight;
  }
  
  const startX = (organizerWidth.value - totalDrawnWidth) / 2;
  const startY = (organizerHeight.value - totalDrawnHeight) / 2;

  // Loop through slots and check if the click is inside one
  organizer.slots?.forEach(async (slot) => {
    const slotX = startX + slot.x_pos * slotWidth;
    const slotY = startY + slot.y_pos * slotHeight;
    const actualWidth = slot.x_units * slotWidth;
    const actualHeight = slot.y_units * slotHeight;

    if (x >= slotX && x <= slotX + actualWidth && y >= slotY && y <= slotY + actualHeight) {
      emit('selected', slot.id as string);
    }
  });
};

defineExpose({
  draw
});
</script>

<style scoped lang="sass">
  .canvas-div
    display: flex
    justify-content: center
    align-items: center
</style>

<template>
  <div class="canvas-div" :style="{ width: props.c_width + 'px', height: props.c_height + 'px' }">
    <canvas :style="canSelect ? 'cursor: pointer;' : ''" ref="canvas" :width="cabinetWidth" :height="cabinetHeight"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

import { IDrawCabinet } from '../../models/storage.model';

const props = defineProps<{
  c_width: number;
  c_height: number;
  canSelect?: boolean;
  storage?: IDrawCabinet | null;
  selectedId?: string | null;
}>();

const emit = defineEmits(['selected']);

const cabinetWidth = computed(() => props.c_width);
const cabinetHeight = computed(() => props.c_height);

const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);

const drawnCabinet = ref<IDrawCabinet | null>(null);

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


const draw = (cab?: IDrawCabinet) => {  
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  if (!ctx) return;

  // Ensure canvas dimensions match calculated dimensions
  if (canvas.value.width !== cabinetWidth.value || canvas.value.height !== cabinetHeight.value) {
      canvas.value.width = cabinetWidth.value;
      canvas.value.height = cabinetHeight.value;
  }

  requestAnimationFrame(() => {
    if (!canvas.value) return;
    const ctx = canvas.value.getContext('2d');
    if (!ctx) return;

    const cabinetToDraw = cab || props.storage;
    
    if (!cabinetToDraw) return;
    
    ctx.clearRect(0, 0, cabinetWidth.value, cabinetHeight.value);
    
    drawnCabinet.value = cabinetToDraw;
    const cabinet = cabinetToDraw;

    // Ensure drawers exist
    const drawersToDraw = cabinet.drawers || [];

    const ratio = cabinet.ratio || 1.0;
    
    // Calculate what the total width would be if we use the ratio
    const widthIfScaledByHeight = cabinet.x_units * (cabinetHeight.value / cabinet.y_units) * ratio;
    
    let drawerWidth, drawerHeight;
    let totalDrawnWidth, totalDrawnHeight;
    
    // Choose the scaling that fits within the canvas
    if (widthIfScaledByHeight <= cabinetWidth.value) {
      // Scale based on height - height is the limiting factor
      const baseUnit = cabinetHeight.value / cabinet.y_units;
      drawerHeight = baseUnit;
      drawerWidth = baseUnit * ratio;
      totalDrawnWidth = cabinet.x_units * drawerWidth;
      totalDrawnHeight = cabinetHeight.value;
    } else {
      // Scale based on width - width is the limiting factor
      const baseUnit = cabinetWidth.value / (cabinet.x_units * ratio);
      drawerHeight = baseUnit;
      drawerWidth = baseUnit * ratio;
      totalDrawnWidth = cabinetWidth.value;
      totalDrawnHeight = cabinet.y_units * drawerHeight;
    }
    
    // Center the drawing on the canvas
    const startX = (cabinetWidth.value - totalDrawnWidth) / 2;
    const startY = (cabinetHeight.value - totalDrawnHeight) / 2;

    // Material-specific settings
    const materialStyles = {
      'plastic': {
        frameColor: "#4A4A4A", // Dark grey for plastic frame
        drawerFrameColor: "#B0B0B0", // Light grey for plastic drawer
        drawerFrameColorUnselected: "#243534",
        drawerInnerColor: "rgba(255, 255, 255, 0.3)", // Clear plastic effect
        drawerInnerColorUnselected: "rgba(255, 255, 255, 0.3)", 
        drawerBorderColor: "#666666", // Drawer border for plastic
        handleColor: "#333333", // Dark grey for plastic handle
      },
      'wood': {
        frameColor: "#6F4E37", // Softer brown for wood frame
        drawerFrameColor: "#C19A6B", // Light wood color for drawers
        drawerFrameColorUnselected: "#C19A6B",
        drawerInnerColor: "#E3C299", // Muted beige for inner drawer
        drawerInnerColorUnselected: "rgba(0, 0,	0, 0.3)",
        drawerBorderColor: "#5D4037", // Deeper wood tone for drawer border
        handleColor: "#4A2F1E", // Dark brown for wood handle
      },
      'metal': {
        frameColor: "#1E90FF",  // Blue metal enclosure
        drawerFrameColor: "#A9A9A9", // Brushed grey for metal drawer
        drawerFrameColorUnselected: "#A9A9A9", // Brushed grey for metal drawer
        drawerInnerColor: "#D3D3D3", // Lighter grey for metal inner drawer
        drawerInnerColorUnselected: "rgba(36, 53, 52, 0.7)",
        drawerBorderColor: "#505050", // Darker grey metal border
        handleColor: "#303030",  // Dark metal for handle
      }
    };

    // Select the material styles based on the 'material' prop
    const material = cabinet.material as 'plastic' | 'wood' | 'metal' ;
    const styles = materialStyles[material] || materialStyles['plastic'];

    // Draw the cabinet outer frame
    ctx.fillStyle = styles.frameColor;
    ctx.fillRect(startX, startY, cabinetWidth.value, cabinetHeight.value);

    // Draw each drawer with the selected material style
    drawersToDraw.forEach((drawer) => {
      const isSelected = props.selectedId === drawer.id;

      const drawerFrameColor = props.selectedId ? 
        (isSelected ? styles.drawerFrameColor : styles.drawerFrameColorUnselected) :
        styles.drawerFrameColor;

      const drawerInnerColor = props.selectedId ? 
        (isSelected ? styles.drawerInnerColor : styles.drawerInnerColorUnselected) :
        styles.drawerInnerColor;

      const drawerX = startX + drawer.x_pos * drawerWidth;
      const drawerY = startY + drawer.y_pos * drawerHeight;
      const actualWidth = drawer.x_units * drawerWidth;
      const actualHeight = drawer.y_units * drawerHeight;

      // Draw the drawer background (frame)
      ctx.fillStyle = drawerFrameColor;
      ctx.fillRect(drawerX, drawerY, actualWidth, actualHeight);

      // For metal, let's add a "brushed metal" effect using a lighter streak
      if (material === 'metal') {
        ctx.fillStyle = "#E0E0E0"; // Lighter grey for streak
        ctx.fillRect(drawerX + 10, drawerY + 10, actualWidth - 20, actualHeight - 20);
      }

      // Draw the inner drawer front
      ctx.fillStyle = drawerInnerColor;
      ctx.fillRect(drawerX + 5, drawerY + 5, actualWidth - 10, actualHeight - 10);

      // Draw the drawer border
      ctx.strokeStyle = styles.drawerBorderColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(drawerX + 5, drawerY + 5, actualWidth - 10, actualHeight - 10);

      // Draw the handle
      ctx.fillStyle = styles.handleColor;
      const handleHeight = material === 'metal' ? 14 : 10;
      const handleWidth = actualWidth / (material === 'metal' ? 3 : 4);
      const handleX = drawerX + (actualWidth - handleWidth) / 2;
      const handleY = drawerY + actualHeight - handleHeight - 10;
      ctx.fillRect(handleX, handleY, handleWidth, handleHeight);

      // Draw the drawer name with sticker
      if (drawer.name) {
        ctx.font = "13px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const textWidth = ctx.measureText(drawer.name).width;
        const stickerWidth = textWidth + 10;
        const stickerHeight = 16;
        const offsetHeight = 8;

        const stickerX = drawerX + (actualWidth - stickerWidth) / 2;
        const stickerY = drawerY + (actualHeight - stickerHeight) / 2 - offsetHeight;

        // Draw sticker background
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(stickerX, stickerY, stickerWidth, stickerHeight);

        // Draw text
        ctx.fillStyle = "#000000";
        ctx.fillText(drawer.name, drawerX + actualWidth / 2, drawerY + actualHeight / 2 - offsetHeight);
      }
    });

    // Draw the cabinet outline (after drawers)
    ctx.strokeStyle = styles.frameColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(startX, startY, totalDrawnWidth, totalDrawnHeight);
  });
};

const handleClick = (event: MouseEvent) => {
  if(props.canSelect === false || !drawnCabinet.value) return;
  if (!canvas.value || !context.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  
  const cabinet = drawnCabinet.value;
  
  // Calculate the same dimensions as in draw()
  const ratio = cabinet.ratio || 1.0;
  const widthIfScaledByHeight = cabinet.x_units * (cabinetHeight.value / cabinet.y_units) * ratio;
  
  let drawerWidth, drawerHeight;
  let totalDrawnWidth, totalDrawnHeight;
  
  if (widthIfScaledByHeight <= cabinetWidth.value) {
    const baseUnit = cabinetHeight.value / cabinet.y_units;
    drawerHeight = baseUnit;
    drawerWidth = baseUnit * ratio;
    totalDrawnWidth = cabinet.x_units * drawerWidth;
    totalDrawnHeight = cabinetHeight.value;
  } else {
    const baseUnit = cabinetWidth.value / (cabinet.x_units * ratio);
    drawerHeight = baseUnit;
    drawerWidth = baseUnit * ratio;
    totalDrawnWidth = cabinetWidth.value;
    totalDrawnHeight = cabinet.y_units * drawerHeight;
  }
  
  const startX = (cabinetWidth.value - totalDrawnWidth) / 2;
  const startY = (cabinetHeight.value - totalDrawnHeight) / 2;

  // Loop through drawers and check if the click is inside one
  cabinet.drawers?.forEach((drawer) => {
    const drawerX = startX + drawer.x_pos * drawerWidth;
    const drawerY = startY + drawer.y_pos * drawerHeight;
    const actualWidth = drawer.x_units * drawerWidth;
    const actualHeight = drawer.y_units * drawerHeight;

    if (x >= drawerX && x <= drawerX + actualWidth && y >= drawerY && y <= drawerY + actualHeight) {
      emit('selected', drawer.id as string);
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

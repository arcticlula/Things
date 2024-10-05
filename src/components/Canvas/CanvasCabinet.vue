<template>
  <canvas class="cabinet-canvas" ref="canvas" :width="props.c_width" :height="props.c_height"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { IDrawCabinet} from '../../models/storage.model';

const props = defineProps<{
  c_width: number;
  c_height: number;
  selectedDrawer?: string
}>();

const emit = defineEmits(['update:selectedDrawer']);

const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);

let cabinet = {} as IDrawCabinet;

const draw = (cab?: IDrawCabinet) => {
  if (cab) cabinet = cab;
  if (!canvas.value || !context.value) return;

  const ctx = context.value;
  const cabinetWidth = props.c_width;
  const cabinetHeight = props.c_height;
  ctx.clearRect(0, 0, cabinetWidth, cabinetHeight);

  const drawerWidth = cabinetWidth / cabinet.x_units;
  const drawerHeight = cabinetHeight / cabinet.y_units;
  
  const startX = 0;
  const startY = 0;

  // Material-specific settings
  const materialStyles = {
    'plastic': {
      frameColor: "#4A4A4A", // Dark grey for plastic frame
      drawerFrameColor: "#B0B0B0", // Light grey for plastic drawer
      drawerInnerColor: "rgba(255, 255, 255, 0.3)", // Clear plastic effect
      drawerBorderColor: "#666666", // Drawer border for plastic
      handleColor: "#333333", // Dark grey for plastic handle
    },
    'wood': {
      frameColor: "#6F4E37", // Softer brown for wood frame
      drawerFrameColor: "#C19A6B", // Light wood color for drawers
      drawerInnerColor: "#E3C299", // Muted beige for inner drawer
      drawerBorderColor: "#5D4037", // Deeper wood tone for drawer border
      handleColor: "#4A2F1E", // Dark brown for wood handle
    },
    'metal': {
      frameColor: "#1E90FF",  // Blue metal enclosure
      drawerFrameColor: "#A9A9A9", // Brushed grey for metal drawer
      drawerInnerColor: "#D3D3D3", // Lighter grey for metal inner drawer
      drawerBorderColor: "#505050", // Darker grey metal border
      handleColor: "#303030",  // Dark metal for handle
    }
  };

  // Select the material styles based on the 'material' prop
  const material = cabinet.material as 'plastic' | 'wood' | 'metal' ;
  const styles = materialStyles[material];

  // Draw the cabinet outer frame
  ctx.fillStyle = styles.frameColor;
  ctx.fillRect(startX, startY, cabinetWidth, cabinetHeight);

  // Draw each drawer with the selected material style
  cabinet.drawers?.forEach((drawer) => {
    const drawerX = startX + drawer.x_pos * drawerWidth;
    const drawerY = startY + drawer.y_pos * drawerHeight;
    const actualWidth = drawer.x_units * drawerWidth;
    const actualHeight = drawer.y_units * drawerHeight;

    // Draw the drawer background (frame)
    const bg = props.selectedDrawer && (drawer?.id === props.selectedDrawer) ? 'yellow' : styles.drawerFrameColor;
    ctx.fillStyle = bg;
    ctx.fillRect(drawerX, drawerY, actualWidth, actualHeight);

    // For metal, let's add a "brushed metal" effect using a lighter streak
    if (material === 'metal') {
      ctx.fillStyle = "#E0E0E0"; // Lighter grey for streak
      ctx.fillRect(drawerX + 10, drawerY + 10, actualWidth - 20, actualHeight - 20);
    }

    // Draw the inner drawer front
    ctx.fillStyle = styles.drawerInnerColor;
    ctx.fillRect(drawerX + 5, drawerY + 5, actualWidth - 10, actualHeight - 10);

    // Draw the drawer border
    ctx.strokeStyle = styles.drawerBorderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(drawerX + 5, drawerY + 5, actualWidth - 10, actualHeight - 10);

    // Draw the handle (thicker for metal for a more mechanical feel)
    ctx.fillStyle = styles.handleColor;
    const handleHeight = material === 'metal' ? 14 : 10; // Thicker handle for metal
    const handleWidth = actualWidth / (material === 'metal' ? 3 : 4); // Wider handle for metal
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
  ctx.strokeRect(startX, startY, cabinetWidth, cabinetHeight);
};

onMounted(() => {
  if (canvas.value) {
    context.value = canvas.value.getContext('2d');
    canvas.value.addEventListener('click', handleClick);
  }
});

onUnmounted(() => {
  if (canvas.value) {
    canvas.value.removeEventListener('click', handleClick);
  }
});

const handleClick = (event: MouseEvent) => {
  if (!canvas.value || !context.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Loop through drawers and check if the click is inside one
  cabinet.drawers.forEach(async (drawer) => {
    const drawerX = drawer.x_pos * (props.c_width / cabinet.x_units);
    const drawerY = drawer.y_pos * (props.c_height / cabinet.y_units);
    const actualWidth = drawer.x_units * (props.c_width / cabinet.x_units);
    const actualHeight = drawer.y_units * (props.c_height / cabinet.y_units);

    if (x >= drawerX && x <= drawerX + actualWidth && y >= drawerY && y <= drawerY + actualHeight) {
      emit('update:selectedDrawer', drawer?.id);
      await nextTick();
      draw();
    }
  });
};

defineExpose({
  draw
});
</script>

<style scoped lang="sass">
  .cabinet-canvas
    cursor: pointer
</style>

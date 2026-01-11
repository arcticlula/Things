<template>
  <canvas ref="canvas" :width="cabinetWidth" :height="cabinetHeight"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';

import { IDrawBox, IStorage } from '../../models/storage.model';
import { generateBoxShades } from '../../utils/color.utils';

const props = defineProps<{
  c_width: number;
  c_height: number;
  storage?: IStorage | null;
}>();

const cabinetWidth = computed(() => props.c_width);
const cabinetHeight = computed(() => props.c_height);

const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);

let box = {} as IDrawBox;

onMounted(() => {
  if (canvas.value) {
    context.value = canvas.value.getContext('2d');
    draw();
  }
});

watch(() => props.storage, () => {
  draw();
});

const draw = (bx?: IDrawBox) => {
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

    const boxToDraw = bx || props.storage;

    if (!boxToDraw) return;
    box = boxToDraw as IDrawBox;

    ctx.clearRect(0, 0, cabinetWidth.value, cabinetHeight.value);

    const boxWidth = box.x_units * 30;
    const boxHeight = box.y_units * 30;
    const boxDepth = box.depth * 10;

    const lidOffset = 4; 
    
    // Calculate total dimensions including depth
    const totalWidth = boxWidth + boxDepth;
    const totalHeight = boxHeight + boxDepth;
    
    // Center the box accounting for the 3D depth
    const startX = (cabinetWidth.value - totalWidth) / 2;
    const startY = (cabinetHeight.value - totalHeight) / 2 + boxDepth;

    const drawCardboardBox = () => {
      // Get colors - use custom color if provided, otherwise use default cardboard colors
      const colors = box.color 
        ? generateBoxShades(box.color)
        : { front: "#755C43", top: "#A6632C", side: "#B5835A" };

      // Draw the front side
      ctx.fillStyle = colors.front;
      ctx.fillRect(startX, startY, boxWidth, boxHeight);
      // Draw the box outline
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, startY, boxWidth, boxHeight);

      // Draw the top
      ctx.fillStyle = colors.top;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + boxDepth, startY - boxDepth);
      ctx.lineTo(startX + boxWidth + boxDepth, startY - boxDepth);
      ctx.lineTo(startX + boxWidth, startY);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw the right side
      ctx.fillStyle = colors.side;
      ctx.beginPath();
      ctx.moveTo(startX + boxWidth, startY);
      ctx.lineTo(startX + boxWidth + boxDepth, startY - boxDepth);
      ctx.lineTo(startX + boxWidth + boxDepth, startY + boxHeight - boxDepth);
      ctx.lineTo(startX + boxWidth, startY + boxHeight);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw the lid if boxLid is true
      if (box.lid) {
        const lidWidth = boxWidth + lidOffset;
        const lidHeight = 10;
        const lidStartX = startX - lidOffset / 2;
        const lidStartY = startY - lidHeight + lidOffset / 2;

        // Draw the front side of the lid
        ctx.fillStyle = colors.side;
        ctx.fillRect(lidStartX, lidStartY, lidWidth, lidHeight);
        // Draw the box outline
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.strokeRect(lidStartX, lidStartY, lidWidth, lidHeight);

        // Draw the top of the lid
        ctx.fillStyle = colors.top;
        ctx.beginPath();
        ctx.moveTo(lidStartX, lidStartY);
        ctx.lineTo(lidStartX + boxDepth, lidStartY - boxDepth);
        ctx.lineTo(lidStartX + lidWidth + boxDepth, lidStartY - boxDepth);
        ctx.lineTo(lidStartX + lidWidth, lidStartY);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw the right side of the lid
        ctx.fillStyle = colors.side;
        ctx.beginPath();
        ctx.moveTo(lidStartX + lidWidth, lidStartY);
        ctx.lineTo(lidStartX + lidWidth + boxDepth, lidStartY - boxDepth);
        ctx.lineTo(lidStartX + lidWidth + boxDepth, lidStartY + lidHeight - boxDepth);
        ctx.lineTo(lidStartX + lidWidth, lidStartY + lidHeight);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const drawPlasticBox = () => {
      // Get colors - use custom color if provided, otherwise use default plastic colors
      const colors = box.color 
        ? generateBoxShades(box.color)
        : { front: "#A0D0FF", top: "#8BBEE0", side: "#5C9CCC" };

      // Draw the front side
      ctx.fillStyle = colors.front;
      ctx.fillRect(startX, startY, boxWidth, boxHeight);

      // Draw the top
      ctx.fillStyle = colors.top;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + boxDepth, startY - boxDepth);
      ctx.lineTo(startX + boxWidth + boxDepth, startY - boxDepth);
      ctx.lineTo(startX + boxWidth, startY);
      ctx.closePath();
      ctx.fill();

      // Draw the box outline
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw the right side
      ctx.fillStyle = colors.side;
      ctx.beginPath();
      ctx.moveTo(startX + boxWidth, startY);
      ctx.lineTo(startX + boxWidth + boxDepth, startY - boxDepth);
      ctx.lineTo(startX + boxWidth + boxDepth, startY + boxHeight - boxDepth);
      ctx.lineTo(startX + boxWidth, startY + boxHeight);
      ctx.closePath();
      ctx.fill();

      // Draw the box outline
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw the backside (transparent effect)
      ctx.globalAlpha = 0.3; // Adjust transparency
      ctx.fillStyle = colors.front;
      ctx.beginPath();
      ctx.moveTo(startX + boxDepth, startY - boxDepth);
      ctx.lineTo(startX + boxWidth + boxDepth, startY - boxDepth);
      ctx.lineTo(startX + boxWidth + boxDepth, startY + boxHeight - boxDepth);
      ctx.lineTo(startX + boxDepth, startY + boxHeight - boxDepth);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add the missing bottom-left ridge
      ctx.beginPath();
      ctx.moveTo(startX, startY + boxHeight);
      ctx.lineTo(startX + boxDepth, startY + boxHeight - boxDepth);
      ctx.lineTo(startX + boxDepth, startY + boxHeight - boxDepth);
      ctx.lineTo(startX, startY + boxHeight);
      ctx.closePath();
      ctx.fill();
      
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Draw the box outline
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.strokeRect(startX, startY, boxWidth, boxHeight);

      // Draw the lid if boxLid is true
      if (box.lid) {
        const lidWidth = boxWidth + lidOffset;
        const lidHeight = 10;
        const lidStartX = startX - lidOffset / 2;
        const lidStartY = startY - lidHeight + lidOffset / 2;

        // Draw the front side of the lid (slightly bigger)
        ctx.fillStyle = box.color ? colors.side + "B3" : "rgba(92, 156, 204, 0.7)";
        ctx.fillRect(lidStartX, lidStartY, lidWidth, lidHeight);
        
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.strokeRect(lidStartX, lidStartY, lidWidth, lidHeight);

        // Draw the top of the lid
        ctx.fillStyle = box.color ? colors.top + "B3" : "rgba(58, 136, 191, 0.7)";
        ctx.beginPath();
        ctx.moveTo(lidStartX, lidStartY);
        ctx.lineTo(lidStartX + boxDepth, lidStartY - boxDepth);
        ctx.lineTo(lidStartX + lidWidth + boxDepth, lidStartY - boxDepth);
        ctx.lineTo(lidStartX + lidWidth, lidStartY);
        ctx.closePath();
        ctx.fill();
        
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Draw the right side of the lid
        ctx.fillStyle = box.color ? colors.top + "B3" : "rgba(58, 136, 191, 0.7)";
        ctx.beginPath();
        ctx.moveTo(lidStartX + lidWidth, lidStartY);
        ctx.lineTo(lidStartX + lidWidth + boxDepth, lidStartY - boxDepth);
        ctx.lineTo(lidStartX + lidWidth + boxDepth, lidStartY + lidHeight - boxDepth);
        ctx.lineTo(lidStartX + lidWidth, lidStartY + lidHeight);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    switch(box.material) {
      case 'plastic':
        drawPlasticBox();
        break;
      case 'cardboard':
        drawCardboardBox();
        break;
    }
  });
};

defineExpose({
  draw
});
</script>

<style scoped lang="sass">

</style>

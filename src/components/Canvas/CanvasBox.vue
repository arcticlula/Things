<template>
  <canvas ref="canvas" :width="props.c_width" :height="props.c_height"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import { IDrawBox } from '../../models/storage.model';
import { useStorageStore } from '../../stores/storage';

const props = defineProps<{
  c_width: number;
  c_height: number;
}>();

const storageStore = useStorageStore();
const { storage } = storeToRefs(storageStore);

const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);

let box = {} as IDrawBox;

onMounted(() => {
  if (canvas.value) {
    context.value = canvas.value.getContext('2d');
  }
});

const draw = (bx?: IDrawBox) => {
  if (bx) box = bx;
  else if (!storage.value || storage.value?.type !== 'box') return;
  else box = storage.value as IDrawBox;
  
  if (!canvas.value || !context.value) return;

  const ctx = context.value;
  const boxWidth = box.x_units * 30;
  const boxHeight = box.y_units * 30;
  const boxDepth = box.depth * 10;
  ctx.clearRect(0, 0, props.c_width, props.c_height);

  const lidOffset = 4; 
  const startX = (props.c_width - boxWidth) / 2;
  const startY = (props.c_height - boxHeight) / 2;

  const drawCardboardBox = () => {
    // Draw the front side
    ctx.fillStyle = "#D3A679"; // Front color
    ctx.fillRect(startX, startY, boxWidth, boxHeight);
    // Draw the box outline
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(startX, startY, boxWidth, boxHeight);

    // Draw the top
    ctx.fillStyle = "#A6632C"; // Top color
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
    ctx.fillStyle = "#B5835A"; // Right side color
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
      ctx.fillStyle = "#B5835A"; // Same as the right side color
      ctx.fillRect(lidStartX, lidStartY, lidWidth, lidHeight);
      // Draw the box outline
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.strokeRect(lidStartX, lidStartY, lidWidth, lidHeight);

      // Draw the top of the lid
      ctx.fillStyle = "#A6632C"; // Top lid color
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
      ctx.fillStyle = "#B5835A"; // Same as the front side color
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
    // Draw the front side
    ctx.fillStyle = "#A0D0FF"; // Front color
    ctx.fillRect(startX, startY, boxWidth, boxHeight);

    // Draw the top
    ctx.fillStyle = "#8BBEE0"; // Top color
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
    ctx.fillStyle = "#5C9CCC"; // Right side color
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
    ctx.fillStyle = "#A0D0FF"; // Same color as the front
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
    ctx.fillStyle = "rgba(92, 156, 204, 0.7)"; // Updated color
    ctx.fillRect(lidStartX, lidStartY, lidWidth, lidHeight);
    
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(lidStartX, lidStartY, lidWidth, lidHeight);

    // Draw the top of the lid
    ctx.fillStyle = "rgba(58, 136, 191, 0.7)"; // Updated color
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
    ctx.fillStyle = "rgba(58, 136, 191, 0.7)"; // Updated color
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
};

defineExpose({
  draw
});
</script>

<style scoped lang="sass">

</style>

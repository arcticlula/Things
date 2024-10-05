<template>
  <canvas ref="canvas" :width="props.c_width" :height="props.c_height"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { IDrawBox } from '../../models/storage.model';

const props = defineProps<{
  c_width: number;
  c_height: number;
}>();

const canvas = ref<HTMLCanvasElement | null>(null);
const context = ref<CanvasRenderingContext2D | null>(null);

let box = {} as IDrawBox;

const draw = (bx?: IDrawBox) => {
  if (bx) box = bx;
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

// const drawBox = () => {
//   if (!canvas.value || !context.value) return;

//   const ctx = context.value;
//   ctx.clearRect(0, 0, boxWidth, boxHeight);

//   const boxWidth = props.rows * 30;
//   const boxHeight = props.cols * 30;
//   const startX = (boxWidth - boxWidth) / 2; // Center horizontally
//   const startY = (boxHeight - boxHeight) / 2; // Center vertically

//   // Draw the box based on material type
//   if (props.material === 'cardboard') {
//     // Draw the bottom part of the cardboard box
//     ctx.fillStyle = "#D3A679"; // Light brown for cardboard
//     ctx.fillRect(startX, startY, boxWidth, boxHeight);

//     if (props.boxLid) {
//       // Draw the thicker flap (lid) if height is less than or equal to width
//       const flapHeight = boxHeight * 0.15; // Flap height relative to the box height
//       ctx.fillStyle = "#B5835A"; // Slightly darker brown for the lid
//       ctx.fillRect(startX, startY - flapHeight, boxWidth, flapHeight);

//       // Add shading to create a more 3D effect for the flap overlap
//       ctx.fillStyle = "rgba(0, 0, 0, 0.1)"; // Subtle shadow for depth
//       ctx.fillRect(startX, startY - flapHeight, boxWidth, flapHeight / 4);

//       // Optional: Add a visible seam on the lid for realism
//       ctx.strokeStyle = "#A6632C"; // Darker brown for seam line
//       ctx.lineWidth = 2;
//       ctx.beginPath();
//       ctx.moveTo(startX, startY - flapHeight);
//       ctx.lineTo(startX + boxWidth, startY - flapHeight);
//       ctx.stroke();
//     }
//   } 
//   else if (props.material === 'plastic') {
//     // Draw the bottom part of the plastic box
//     ctx.fillStyle = "#A0D0FF"; // Light blue for plastic
//     ctx.fillRect(startX, startY, boxWidth, boxHeight);
//     if (props.boxLid) {
//       // Draw the lid
//       const lidHeight = boxHeight * 0.1;
//       ctx.fillStyle = "#5C9CCC"; // Darker blue for the lid
//       ctx.fillRect(startX, startY - lidHeight, boxWidth, lidHeight);

//       // Draw container shading for depth
//       ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
//       ctx.fillRect(startX, startY, boxWidth, lidHeight / 2);
//     }
//   }

//   // Add a border for both types
//   ctx.strokeStyle = "#000"; // Black for the border
//   ctx.lineWidth = 2;
//   ctx.strokeRect(startX, startY, boxWidth, boxHeight);
// };

onMounted(() => {
  if (canvas.value) {
    context.value = canvas.value.getContext('2d');
  }
});

defineExpose({
  draw
});
</script>

<style scoped lang="sass">

</style>

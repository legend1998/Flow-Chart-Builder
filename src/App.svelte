<style>
.screen{
  display: flex;
  flex-direction: row;
  
}
.tools{
 width: 80px;
 padding: 0;
 position: fixed;
 z-index: 100;
 color: white;
 background-color: #242424;
 display: flex;
 flex-direction:column;
 align-items: center;
 justify-content: center;
}

#canvasBox{
  position: relative;
  height: 100vh;
  widows: 100vw;
  overflow: hidden;
}
.instruction{
  position: sticky;
  z-index: 10px;
  bottom: 20px;
  left: 1px;
color: white;
font-size: 12px;
}
.instruction p{
  padding: 0;
  margin: 0;
}
</style>

<main>
 <div class="screen">
  <div id="canvasBox"><canvas tabindex="1" id="canvas"></canvas>
  <div class="instruction">
    <p>Instructions</p>
    <p class="">Rectangle - Ctrl + B</p>
    <p class="">Circle  - Ctrl + C</p>
    <p class="">Delete Block  - Right Click</p>
    <p class="">zoom  - Scroll</p>
    <p class="">Pan  - Space + mouse</p>
  </div>
  <div class="">Tools</div>
  </div>
  
 </div>
</main>

<script lang="ts">
  import {onMount} from "svelte";
  import { Board } from "./files/utils";
  onMount(()=>{
    const canvas = <HTMLCanvasElement> document.getElementById("canvas");
      loop(canvas);
  })


   function loop(canvas: HTMLCanvasElement ){
    var board = new Board(canvas)
    board.draw()
    }

</script>
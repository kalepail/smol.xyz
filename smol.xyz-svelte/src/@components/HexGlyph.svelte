<script>
  export let width
  export let px
  export let palette
</script>

<ul class="flex flex-wrap {$$props.class}" style:width="{px}px" style:box-shadow="0 0 0 1px #e5e7eb">
  {#each palette as hex, i (i)}
  <li style:background-color={hex} style:width="{px / width}px" style:height="{px / width}px" ></li>
  {/each}
</ul>
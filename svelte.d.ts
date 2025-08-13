declare module '*.svelte' {
  import { SvelteComponentTyped } from "svelte";
  export default class SvelteComponent extends SvelteComponentTyped<any, any, any> {}
}

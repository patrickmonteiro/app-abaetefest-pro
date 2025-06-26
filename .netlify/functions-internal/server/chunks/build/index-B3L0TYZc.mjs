import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs } from 'vue/server-renderer';
import { e as useSeoMeta } from './server.mjs';
import 'node:http';
import 'node:https';
import 'node:zlib';
import 'node:stream';
import 'node:buffer';
import 'node:util';
import 'node:url';
import 'node:net';
import 'node:fs';
import 'node:path';
import '../nitro/nitro.mjs';
import 'node:events';
import 'node:crypto';
import '@iconify/utils';
import 'consola';
import 'ipx';
import 'vue-router';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/plugins';
import 'unhead/utils';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useSeoMeta({
      title: "Meu App Nuxt",
      ogTitle: "Meu App Nuxt",
      description: "Aplica\xE7\xE3o Nuxt 3 com DaisyUI, TypeScript, PWA e SSR",
      ogDescription: "Aplica\xE7\xE3o Nuxt 3 com DaisyUI, TypeScript, PWA e SSR"
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-base-200" }, _attrs))}><div class="navbar bg-primary text-primary-content"><div class="flex-1"><a class="btn btn-ghost normal-case text-xl">App AbaetefestPro</a></div></div><div class="hero min-h-screen"><div class="hero-content text-center"><div class="max-w-md"><h1 class="text-5xl font-bold">Funcionando! \u{1F680}</h1><p class="py-6">Nuxt 3 + DaisyUI + TypeScript est\xE1 configurado e rodando perfeitamente!</p><div class="flex gap-2 justify-center"><button class="btn btn-primary">Primary</button><button class="btn btn-secondary">Secondary</button><button class="btn btn-accent">Accent</button></div><div class="mt-4"><div class="alert alert-success"><span>\u2705 Setup completo com sucesso!</span></div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B3L0TYZc.mjs.map

import { d as useHead, _ as __nuxt_component_0 } from './server.mjs';
import { defineComponent, ref, computed, resolveComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@iconify/utils';
import 'consola';
import 'node:url';
import 'ipx';
import 'vue-router';
import '@iconify/vue';
import '@iconify/utils/lib/css/icon';
import 'perfect-debounce';
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
    const isOnline = ref(true);
    const loading = ref(false);
    const serviceWorkerRegistration = ref(null);
    const pwaStatus = computed(() => {
      return "Verificando...";
    });
    const networkStatus = computed(() => {
      return "Verificando...";
    });
    const connectionType = computed(() => {
      return "Unknown";
    });
    const connectionClass = computed(() => {
      const type = connectionType.value;
      return {
        "badge badge-success": type === "4g",
        "badge badge-warning": type === "3g",
        "badge badge-error": type === "2g" || type === "slow-2g",
        "badge badge-ghost": type === "Unknown"
      };
    });
    const swStatus = computed(() => {
      if (!serviceWorkerRegistration.value) return "N\xE3o instalado";
      return "Ativo e funcionando";
    });
    const swState = computed(() => {
      return serviceWorkerRegistration.value ? "Ativo" : "Inativo";
    });
    const swClass = computed(() => {
      return serviceWorkerRegistration.value ? "badge badge-success" : "badge badge-error";
    });
    useHead({
      title: "AbaetefestPro - PWA with Nuxt 3",
      meta: [
        { name: "description", content: "Progressive Web App desenvolvida com Nuxt 3 e DaisyUI" },
        { property: "og:title", content: "AbaetefestPro PWA" },
        { property: "og:description", content: "Progressive Web App desenvolvida com Nuxt 3 e DaisyUI" },
        { property: "og:type", content: "website" }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_PWADebug = resolveComponent("PWADebug");
      const _component_PWADeepDebug = resolveComponent("PWADeepDebug");
      const _component_Icon = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-base-100" }, _attrs))}><div class="container mx-auto px-4 py-8"><div class="text-center mb-8"><h1 class="text-4xl font-bold text-primary mb-4"> AbaetefestPro </h1><p class="text-lg text-base-content/70"> Aplica\xE7\xE3o PWA com Nuxt 3 + DaisyUI </p></div>`);
      _push(ssrRenderComponent(_component_PWADebug, null, null, _parent));
      _push(ssrRenderComponent(_component_PWADeepDebug, null, null, _parent));
      _push(`<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"><div class="card bg-base-200 shadow-lg"><div class="card-body"><h2 class="card-title">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:device-phone-mobile",
        class: "h-6 w-6"
      }, null, _parent));
      _push(` PWA Status </h2><p class="text-sm">${ssrInterpolate(pwaStatus.value)}</p><div class="card-actions justify-end"><div class="badge badge-primary">${ssrInterpolate(isOnline.value ? "Online" : "Offline")}</div></div></div></div><div class="card bg-base-200 shadow-lg"><div class="card-body"><h2 class="card-title">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:wifi",
        class: "h-6 w-6"
      }, null, _parent));
      _push(` Conex\xE3o </h2><p class="text-sm">${ssrInterpolate(networkStatus.value)}</p><div class="card-actions justify-end"><div class="${ssrRenderClass(connectionClass.value)}">${ssrInterpolate(connectionType.value)}</div></div></div></div><div class="card bg-base-200 shadow-lg"><div class="card-body"><h2 class="card-title">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:cog-6-tooth",
        class: "h-6 w-6"
      }, null, _parent));
      _push(` Service Worker </h2><p class="text-sm">${ssrInterpolate(swStatus.value)}</p><div class="card-actions justify-end"><div class="${ssrRenderClass(swClass.value)}">${ssrInterpolate(swState.value)}</div></div></div></div></div><div class="text-center"><button class="btn btn-primary btn-lg mr-4"${ssrIncludeBooleanAttr(loading.value) ? " disabled" : ""}>`);
      if (loading.value) {
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:arrow-path",
          class: "h-5 w-5 animate-spin"
        }, null, _parent));
      } else {
        _push(ssrRenderComponent(_component_Icon, {
          name: "heroicons:arrow-path",
          class: "h-5 w-5"
        }, null, _parent));
      }
      _push(` Verificar Atualiza\xE7\xF5es </button><button class="btn btn-outline btn-lg mr-4">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:information-circle",
        class: "h-5 w-5"
      }, null, _parent));
      _push(` Info PWA </button><button class="btn btn-secondary btn-lg">`);
      _push(ssrRenderComponent(_component_Icon, {
        name: "heroicons:wrench-screwdriver",
        class: "h-5 w-5"
      }, null, _parent));
      _push(` Debug Install </button></div></div></div>`);
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
//# sourceMappingURL=index-DNy4rWaN.mjs.map

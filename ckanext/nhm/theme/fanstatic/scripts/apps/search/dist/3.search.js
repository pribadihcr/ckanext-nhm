(window.webpackJsonpsearch=window.webpackJsonpsearch||[]).push([[3],{518:function(e,r,s){"use strict";s.r(r);var t=function(){var e=this,r=e.$createElement,s=e._self._c||r;return s("div",{staticClass:"fields resourceid-list floating flex-container flex-column flex-left"},[s("div",[s("input",{directives:[{name:"model",rawName:"v-model",value:e.allResourcesToggle,expression:"allResourcesToggle"}],attrs:{type:"checkbox",id:"toggleAll"},domProps:{checked:Array.isArray(e.allResourcesToggle)?e._i(e.allResourcesToggle,null)>-1:e.allResourcesToggle},on:{change:[function(r){var s=e.allResourcesToggle,t=r.target,c=!!t.checked;if(Array.isArray(s)){var o=e._i(s,null);t.checked?o<0&&(e.allResourcesToggle=s.concat([null])):o>-1&&(e.allResourcesToggle=s.slice(0,o).concat(s.slice(o+1)))}else e.allResourcesToggle=c},e.toggleAllResourceSelect]}}),e._v(" "),s("label",{attrs:{for:"toggleAll"}},[e._v("Select all")])]),e._v(" "),e._l(e.packageList,(function(r,t){return s("span",{key:r.id},[s("a",{attrs:{href:"#",id:r.id,value:r.id},on:{click:function(r){return e.togglePackageResources(t)}}},[e._v(e._s(r.name))]),e._v(" "),s("div",{staticClass:"fields"},e._l(r.resources,(function(r){return s("span",{key:r.id},[s("input",{directives:[{name:"model",rawName:"v-model",value:e.resourceIds,expression:"resourceIds"}],attrs:{type:"checkbox",id:r.id},domProps:{value:r.id,checked:Array.isArray(e.resourceIds)?e._i(e.resourceIds,r.id)>-1:e.resourceIds},on:{change:function(s){var t=e.resourceIds,c=s.target,o=!!c.checked;if(Array.isArray(t)){var l=r.id,n=e._i(t,l);c.checked?n<0&&(e.resourceIds=t.concat([l])):n>-1&&(e.resourceIds=t.slice(0,n).concat(t.slice(n+1)))}else e.resourceIds=o}}}),e._v(" "),s("label",{attrs:{for:r.id}},[e._v(e._s(r.name))])])})),0)])}))],2)};t._withStripped=!0;var c=s(2);function o(e,r){var s=Object.keys(e);if(Object.getOwnPropertySymbols){var t=Object.getOwnPropertySymbols(e);r&&(t=t.filter((function(r){return Object.getOwnPropertyDescriptor(e,r).enumerable}))),s.push.apply(s,t)}return s}function l(e){for(var r,s=1;s<arguments.length;s++)r=null==arguments[s]?{}:arguments[s],s%2?o(Object(r),!0).forEach((function(s){n(e,s,r[s])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(s){Object.defineProperty(e,s,Object.getOwnPropertyDescriptor(r,s))}));return e}function n(e,r,s){return r in e?Object.defineProperty(e,r,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[r]=s,e}var u={name:"ResourceList",data:function(){return{allResourcesToggle:!1}},computed:l({},Object(c.e)("results/query/resources",["packageList"]),{resourceIds:{get:function(){return this.$store.state.results.query.resources.resourceIds},set:function(e){this.setResourceIds(e)}}}),methods:l({},Object(c.d)("results/query/resources",["togglePackageResources","selectAllResources","setResourceIds"]),{toggleAllResourceSelect:function(e){e.target.checked?this.selectAllResources():this.resourceIds=[]}}),watch:{resourceIds:function(e,r){e.length<r.length&&(this.allResourcesToggle=!1)}}},a=s(4),i=Object(a.a)(u,t,[],!1,null,null,null);i.options.__file="src/components/ResourceList.vue";r.default=i.exports}}]);
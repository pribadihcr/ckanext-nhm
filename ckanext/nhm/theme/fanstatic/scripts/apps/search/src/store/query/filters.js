import * as d3 from 'd3-collection';
import Vue from 'vue';
import shortid from 'shortid';
import {camelCase} from '../utils';
import staticPresets from './presets/static';
import dynamicPresets from './presets/dynamic';

let initialFilters = {
    group_root: {
        parent:  null,
        key:     'and',
        content: [],
        name:    ''
    }
};

let filters = {
    namespaced: true,
    modules:    {
        staticPresets,
        dynamicPresets
    },
    state:      {
        items:        {...initialFilters},
        parsingError: null
    },
    getters:    {
        count:         (state) => {
            return d3.keys(state.items).length;
        },
        getFilterById: (state) => (id) => {
            return state.items[id];
        },
        getChildren:   (state) => (id, asArray) => {
            let children = d3.entries(state.items)
                             .filter(f => f.value.parent === id);
            if (asArray) {
                return children;
            }
            else {
                return d3.nest()
                         .key(d => d.key)
                         .rollup(d => d[0].value)
                         .object(children);
            }
        },
        getNestLevel:  (state, getters) => (id) => {
            let filter    = getters.getFilterById(id);
            let nestLevel = 0;
            while (filter.parent !== null) {
                nestLevel++;
                filter = getters.getFilterById(filter.parent);
            }
            return nestLevel;
        },
        queryfy:       (state, getters) => (id) => {
            let data      = state.items[id];
            let queryData = {};
            let isGroup   = id.startsWith('group_');
            if (!isGroup) {
                queryData[data.key] = data.content;
            }
            else {
                queryData[data.key] = getters.getChildren(id, true)
                                             .map(c => getters.queryfy(c.key));
            }
            return queryData;
        },
        hasFilter:     (state) => (payload) => {
            // TODO: check for equality in a better/more consistent way
            let filterContent = JSON.stringify(payload.content);
            return d3.values(state.items).some(i => {
                return payload.parent === i.parent && payload.key === i.key && filterContent === JSON.stringify(i.content);
            })
        },
        presets:       (state, getters) => {
            return $.extend(getters['staticPresets/presets'], getters['dynamicPresets/presets'])
        }
    },
    mutations:  {
        setFromQuery(state, query) {
            let currentState = {...state.items};
            try {
                if (query.filters === undefined) {
                    state.items = {...initialFilters};
                }
                else {
                    let dequeryfy = (items, parent) => {
                        let itemList = {};
                        items.forEach((i) => {
                            let item = d3.entries(i)[0];
                            if (Array.isArray(item.value)) {
                                let groupId       = parent === null ? 'group_root' : `group_${shortid.generate()}`;
                                itemList[groupId] = {
                                    parent:  parent,
                                    key:     item.key,
                                    content: []
                                };
                                d3.entries(dequeryfy(item.value, groupId)).forEach((f) => {
                                    itemList[f.key] = f.value;
                                });
                            }
                            else {
                                itemList[`term_${shortid.generate()}`] = {
                                    parent:  parent,
                                    key:     item.key,
                                    content: item.value
                                }
                            }
                        });
                        return itemList;
                    };

                    let dequeried = dequeryfy([query.filters], null);
                    state.items   = {...dequeried};
                }
                state.parsingError = null;
            } catch (e) {
                state.parsingError = e;
                // revert back to previous state
                state.items        = {...currentState};
            }
        },
        changeKey(state, payload) {
            Vue.set(state.items[payload.id], 'key', payload.key);
        },
        changeContent(state, payload) {
            Vue.set(state.items[payload.id], 'content', payload.content);
        },
        deleteFilter(state, filterId) {
            if (state.items[filterId].parent === null) {
                return;
            }
            Vue.delete(state.items, filterId)
        },
        resetFilters(state) {
            state.items = {...initialFilters};
        },
        addFilter(state, payload) {
            let newFilter = {
                parent:  payload.parent,
                key:     payload.key,
                content: payload.content,
                name:    payload.name || ''
            };

            let filterKey;
            if (newFilter.name !== '') {
                filterKey = camelCase(newFilter.name);
            }
            else {
                filterKey = shortid.generate();
            }
            let filterName = `${payload.type}_${filterKey}`;
            Vue.set(state.items, filterName, newFilter);
        }
    },
    actions:    {
        addGroup(context, payload) {
            let newGroup = {
                parent:  payload.parent,
                key:     'and',
                content: [],
                name:    payload.name || '',
                type:    'group'
            };
            context.commit('addFilter', newGroup)
        },
        addTerm(context, payload) {
            let newTerm = {
                parent:  payload.parent,
                key:     payload.key,
                content: payload.content,
                name:    payload.name || '',
                type:    'term'
            };
            context.commit('addFilter', newTerm)
        },
        addPreset(context, payload) {
            let preset;
            if (context.getters['staticPresets/keys'].includes(payload.key)) {
                preset = context.state.staticPresets[payload.key];
            }
            else if (context.getters['dynamicPresets/keys'].includes(payload.key)) {
                let presetDetails = context.state.dynamicPresets[payload.key];
                let args          = {};
                presetDetails.args.state.forEach(s => {
                    args[s] = context.rootState[s];
                });
                presetDetails.args.getters.forEach(g => {
                    args[g] = context.rootGetters[g]
                });
                preset = context.getters[`dynamicPresets/${payload.key}`](args);
            }
            else {
                return;
            }
            let newFilter = {
                parent:  payload.parent,
                key:     preset.key,
                content: preset.content,
                name:    preset.name + payload.parent.replace('group_', ''),
                type:    preset.type
            };

            if (!context.getters.hasFilter(newFilter)) {
                context.commit('addFilter', newFilter);
                return true;
            }

            return false;
        }
    }
};

export default filters;
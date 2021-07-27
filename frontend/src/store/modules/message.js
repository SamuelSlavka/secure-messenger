import Vue from 'vue';
import * as types from '@/store/mutation-types';
import { doAsync } from '@/api/async-util';
import { addMutations } from '@/modules/generalFunc';

const state = {
  messages: {
    offset: 0,
    count: 10,
    lastmessage: undefined,
    messageList: [],
  },
};

const getters = {
};

const mutations = addMutations(types, Vue);

const actions = {
  postAsync(store, contents) {
    const token = sessionStorage.getItem('token');
    return doAsync(
      store, {
        contents, token, mutationTypes: types.POST_INFO_ACTION,
      },
    );
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

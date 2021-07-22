/* eslint-disable no-shadow */
import Vue from 'vue';
import * as types from '@/store/mutation-types';
import { doAsync } from '@/api/async-util';
import { addMutations } from '@/modules/generalFunc';

const state = {
  info: {
    abi: null,
    contractAddress: null,
    userAddress: null,
    userName: null,
  },
};

const getters = {
  getAbi: (state) => state.info.username,
  getContractAddress: (state) => state.info.contractAddress,
  getUserAddess: (state) => state.info.userAddress,
  getUserName: (state) => state.info.userName,
};

const mutations = addMutations(types, Vue);

const actions = {
  postAsync(store, contents) {
    const token = sessionStorage.getItem('token');
    return doAsync(
      store, {
        contents, token, mutationTypes: types.POST_INFO_ASYNC,
      },
    );
  },

  // login action
  postContactsAsync(store, contents) {
    const token = sessionStorage.getItem('token');

    return doAsync(
      store, {
        contents, token, mutationTypes: types.POST_CONTACTS_ASYNC,
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

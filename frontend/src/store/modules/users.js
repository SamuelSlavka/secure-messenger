/* eslint-disable no-shadow */
import Vue from 'vue';
import * as types from '@/store/mutation-types';
import { doAsync, doWeb3Async } from '@/api/async-util';
import { getBalance } from '@/modules/web3Func';
import { addMutations } from '@/modules/generalFunc';

const state = {
  balance: 0,
  info: {
    abi: null,
    contractAddress: null,
  },
};

const getters = {
  getAbi: (state) => state.info.username,
  getContractAddress: (state) => state.info.contractAddress,
  getBalance: (state) => state.balance,
};

// general action mutation types
const mutations = addMutations(types, Vue);
// set balance
mutations.SET_BALANCE = (state, balance) => {
  state.balance = balance;
};

const actions = {
  // get balance action
  async getBalanceAction(store, contents) {
    await doWeb3Async(store, {
      contents: { data: contents.address, method: getBalance },
      mutationTypes: types.GET_BALANCE_ACTION,
    });
    store.commit('SET_BALANCE', store.state.getBalanceActionData);
  },

  // get balance action
  addFoundsAction(store, data) {
    const token = sessionStorage.getItem('token');
    const contents = {
      url: '/poor',
      type: 'post',
      data,
    };
    return doAsync(
      store, {
        contents, token, mutationTypes: types.ADD_FOUNDS_ACTION,
      },
    );
  },

  // refresh contacts action
  getContactsAction(store, data) {
    const token = sessionStorage.getItem('token');
    const contents = {
      url: '/contacts',
      type: 'post',
      data,
    };

    return doAsync(
      store, {
        contents, token, mutationTypes: types.GET_CONTACTS_ACTION,
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

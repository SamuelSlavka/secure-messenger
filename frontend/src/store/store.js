import Vue from 'vue';
import Vuex from 'vuex';
import doAsync from '@/api/async-util';
import * as types from '@/api/mutation-types';
import { createAccount } from '@/modules/web3Func';

Vue.use(Vuex);

const CryptoJS = require('crypto-js');

const state = {
  tester: 'tester',
};

const mutations = {
};

// dynamically add state mutations
Object.keys(types).forEach((type) => {
  mutations[types[type].BASE] = (newState, payload) => {
    switch (payload.type) {
      case types[type].PENDING:
        return Vue.set(newState, types[type].loadingKey, payload.value);

      case types[type].SUCCESS:
        Vue.set(newState, types[type].statusCode, payload.statusCode);
        return Vue.set(newState, types[type].stateKey, payload.data);

      // failiure
      default:
        return Vue.set(newState, types[type].statusCode, payload.statusCode);
    }
  };
});

const getTitleOnly = (response) => response.data.title;

const actions = {
  getAsync(store, contents) {
    return doAsync(
      store, {
        contents, mutationTypes: types.GET_INFO_ASYNC, callback: getTitleOnly,
      },
    );
  },
  postAsync(store, contents) {
    const token = sessionStorage.getItem('token');
    return doAsync(
      store, {
        contents, token, mutationTypes: types.POST_INFO_ASYNC,
      },
    );
  },

  // login action
  async postLoginAsync(store, contents) {
    const token = sessionStorage.getItem('token');
    console.log(contents);
    await doAsync(
      store, {
        contents, token, mutationTypes: types.POST_LOGIN_ASYNC,
      },
    );
    // add items to session storage
    if (store.state.postLoginAsyncData?.data?.access_token) {
      sessionStorage.setItem('token', store.state.postRegisterAsyncData.data.access_token);
      const addressContents = { url: '/address', type: 'post', data: { username: contents.data.username } };
      // save account address in server
      const publicKey = await store.dispatch('postAsync', addressContents);

      // stores encripterd private key in local storage
      localStorage.setItem('privateKey', (CryptoJS.AES.encrypt(contents.data.privateKey, contents.data.password)));
      localStorage.setItem('publicKey', publicKey);
      sessionStorage.setItem('passwdKey', contents.data.password);
    }
    return null;
  },

  // register action
  async postRegisterAsync(store, contents) {
    const token = sessionStorage.getItem('token');
    await doAsync(
      store, {
        contents, token, mutationTypes: types.POST_REGISTER_ASYNC,
      },
    );

    // add items to session storage
    if (store.state.postRegisterAsyncData?.data?.access_token) {
      sessionStorage.setItem('token', store.state.postRegisterAsyncData.data.access_token);

      const acc = await createAccount();

      const addressContents = { url: '/saveaddress', type: 'post', data: { address: acc.address, public: acc.publicKey } };
      // save account address in server
      store.dispatch('postAsync', addressContents);

      // stores encripterd private key in local storage
      localStorage.setItem('privateKey', (CryptoJS.AES.encrypt(acc.privateKey, contents.data.password)));
      localStorage.setItem('publicKey', acc.publicKey);
      sessionStorage.setItem('passwdKey', contents.data.password);
    }
  },
};

export default new Vuex.Store({
  state,
  mutations,
  actions,
});

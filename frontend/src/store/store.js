import Vue from 'vue';
import Vuex from 'vuex';
import doAsync from '@/api/async-util';
import * as types from '@/api/mutation-types';
import { createAccount } from '@/modules/web3Func';

Vue.use(Vuex);

const CryptoJS = require('crypto-js');

const state = {
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
  clearAuthState(store, cleanTypes) {
    cleanTypes.forEach((type) => {
      store.commit(type.BASE, {
        type: type.SUCCESS,
        value: {},
      });
      store.commit(type.BASE, {
        type: type.FAILURE,
        value: null,
      });
    });
  },

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
    let token = sessionStorage.getItem('token');

    await doAsync(
      store, {
        contents, token, mutationTypes: types.POST_INFO_ASYNC,
      },
    );
    // add items to session storage
    if (store.state.postInfoAsyncData?.data?.access_token) {
      sessionStorage.setItem('token', store.state.postInfoAsyncData.data.access_token);
      token = sessionStorage.getItem('token');

      const addressContents = { url: '/address', type: 'post', data: { username: contents.data.username } };
      // save account address in server
      await doAsync(
        store, {
          contents: addressContents, token, mutationTypes: types.POST_LOGIN_ASYNC,
        },
      );

      // stores encripterd private key in local storage
      localStorage.setItem('privateKey', (CryptoJS.AES.encrypt(contents.data.privateKey, contents.data.password)));
      localStorage.setItem('publicKey', store.state.postLoginAsyncData?.data?.publicKey);
      sessionStorage.setItem('passwdKey', contents.data.password);
    }
    return null;
  },

  // register action
  async postRegisterAsync(store, contents) {
    let token = sessionStorage.getItem('token');
    await doAsync(
      store, {
        contents, token, mutationTypes: types.POST_INFO_ASYNC,
      },
    );

    // add items to session storage
    if (store.state.postInfoAsyncData?.data?.access_token) {
      sessionStorage.setItem('token', store.state.postInfoAsyncData.data.access_token);
      token = sessionStorage.getItem('token');
      const acc = await createAccount();

      const addressContents = { url: '/saveaddress', type: 'post', data: { address: acc.address, public: acc.publicKey } };

      // save account address in server
      await doAsync(
        store, {
          contents: addressContents, token, mutationTypes: types.POST_REGISTER_ASYNC,
        },
      );

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

/* eslint-disable no-shadow */
import Vue from 'vue';
import * as types from '@/store/mutation-types';
import { doAsync } from '@/api/async-util';
import { createAccount } from '@/modules/web3Func';
import { addMutations } from '@/modules/generalFunc';

const state = {
  currentpage: 'userlist',
  token: sessionStorage.getItem('token'),
  user: {
    username: sessionStorage.getItem('username'),
    password: sessionStorage.getItem('password'),
    address: sessionStorage.getItem('address'),
    publicKey: sessionStorage.getItem('publicKey'),
  },
};

const getters = {
  getToken: (state) => state.token,
  getCurrentPage: (state) => state.currentpage,
  getUsername: (state) => state.user.username,
  getAddress: (state) => state.user.address,
  getPublicKey: (state) => state.user.publicKey,
  getPassword: (state) => state.user.password,
};

// general action mutation types
const mutations = addMutations(types, Vue);
// set current page
mutations.SET_CURRENTPAGE = (state, value) => {
  state.currentpage = value;
};
// creates user in vuex
mutations.SET_USER = (state, params) => {
  state.token = params.token;
  sessionStorage.setItem('token', params.token);

  state.user = params.user;
  sessionStorage.setItem('username', params.user.username);
  sessionStorage.setItem('address', params.user.address);
  sessionStorage.setItem('publicKey', params.user.publicKey);
  sessionStorage.setItem('password', params.user.password);
};

const CryptoJS = require('crypto-js');

const actions = {
  clearAuthState(store, cleanTypes) {
    const newuser = {
      address: null,
      username: null,
      password: null,
      publicKey: null,
    };
    // clear vuex
    store.commit('SET_USER', { token: undefined, user: newuser });
    // clear session storage
    sessionStorage.clear();
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

  postAsync(store, contents) {
    const token = store.state.getToken();
    return doAsync(
      store, {
        contents, token, mutationTypes: types.POST_INFO_ACTION,
      },
    );
  },

  // login action
  async loginAction(store, data) {
    let token = store.state.getToken();

    const contents = {
      url: '/login',
      type: 'post',
      data,
    };
    await doAsync(
      store, {
        contents, token, mutationTypes: types.POST_INFO_ACTION,
      },
    );
    // add items to session storage
    if (store.state.postInfoActionData?.data?.access_token) {
      token = store.state.postInfoActionData.data.access_token;

      const addressContents = { url: '/address', type: 'post', data: { username: contents.data.username } };
      // save account address in server
      const address = await doAsync(
        store, {
          contents: addressContents, token, mutationTypes: types.LOGIN_ACTION,
        },
      );

      const newuser = {
        address,
        username: contents.data.username,
        password: contents.data.password,
        publicKey: store.state.loginActionData?.data?.publicKey,
      };
      // save results to vuex
      store.commit('SET_USER', { token, user: newuser });

      localStorage.setItem('privateKey', (CryptoJS.AES.encrypt(contents.data.privateKey, contents.data.password)));
    }

    return null;
  },

  // register action
  async registerAction(store, data) {
    let token = sessionStorage.getItem('token');
    const contents = {
      url: '/register',
      type: 'post',
      data,
    };
    await doAsync(
      store, {
        contents, token, mutationTypes: types.POST_INFO_ACTION,
      },
    );

    // add items to session storage
    if (store.state.postInfoActionData?.data?.access_token) {
      token = store.state.postInfoActionData.data.access_token;

      const acc = await createAccount();
      const addressContents = { url: '/saveaddress', type: 'post', data: { address: acc.address, public: acc.publicKey } };

      // save account address in server
      await doAsync(
        store, {
          contents: addressContents, token, mutationTypes: types.REGISTER_ACTION,
        },
      );

      const newuser = {
        address: acc.address,
        username: contents.data.username,
        password: contents.data.password,
        publicKey: acc.publicKey,
      };

      // save results to vuex
      store.commit('SET_USER', { token, user: newuser });

      // stores encripterd private key in local storage
      localStorage.setItem('privateKey', (CryptoJS.AES.encrypt(acc.privateKey, contents.data.password)));
    }
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};

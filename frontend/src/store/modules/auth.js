/* eslint-disable no-shadow */
import Vue from 'vue';
import * as types from '@/store/mutation-types';
import { doAsync, doWeb3Async } from '@/api/async-util';
import { createAccount, getBalance } from '@/modules/web3Func';
import { addMutations } from '@/modules/generalFunc';

const state = {
  loggedin: undefined,
  currentpage: 'userlist',
  user: {
    username: sessionStorage.getItem('username'),
    password: sessionStorage.getItem('password'),
    address: sessionStorage.getItem('address'),
    publickey: sessionStorage.getItem('publickey'),
    balance: 0,
  },
};

const getters = {
  getCurrentPage: (state) => state.currentpage,
  getLoggedin: (state) => state.loggedin,
  getUsername: (state) => state.user.username,
  getAddress: (state) => state.user.address,
  getPublicKey: (state) => state.user.publickey,
  getPassword: (state) => state.user.password,
};

const mutations = addMutations(types, Vue);
mutations.SET_CURRENTPAGE = (state, value) => {
  state.currentpage = value;
};

mutations.SET_LOGGEDIN = (state, value) => {
  state.loggedin = value;
};

mutations.SET_BALANCE = (state, balance) => {
  state.user.balance = balance;
};

mutations.SET_USER = (state, params) => {
  console.log(params);
  state.loggedin = params.loggedin;
  state.user = params.user;
  sessionStorage.setItem('username', params.user.username);
  sessionStorage.setItem('address', params.user.address);
  sessionStorage.setItem('publickey', params.user.publickey);
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
    store.commit('SET_USER', { loggedin: undefined, user: newuser });
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

  // get balance action
  async getUserBalance(store) {
    await doWeb3Async(store, {
      contents: { data: store.state.user.address, method: getBalance },
      mutationTypes: types.GET_BALANCE_ASYNC,
    });
    store.commit('SET_BALANCE', store.state.getBalanceAsyncData);
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
      const address = await doAsync(
        store, {
          contents: addressContents, token, mutationTypes: types.POST_LOGIN_ASYNC,
        },
      );

      const newuser = {
        address,
        username: contents.data.username,
        password: contents.data.password,
        publicKey: store.state.postLoginAsyncData?.data?.publicKey,
      };
      // save results to vuex
      store.commit('SET_USER', { loggedin: true, user: newuser });

      localStorage.setItem('privateKey', (CryptoJS.AES.encrypt(contents.data.privateKey, contents.data.password)));
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

      const newuser = {
        address: acc.address,
        username: contents.data.username,
        password: contents.data.password,
        publicKey: acc.publicKey,
      };

      // save results to vuex
      store.commit('SET_USER', { loggedin: true, user: newuser });

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

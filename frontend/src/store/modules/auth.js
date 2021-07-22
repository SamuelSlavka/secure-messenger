/* eslint-disable no-shadow */
import Vue from 'vue';
import * as types from '@/store/mutation-types';
import { doAsync, doWeb3Async } from '@/api/async-util';
import { createAccount, getBalance } from '@/modules/web3Func';
import { addMutations } from '@/modules/generalFunc';

const state = {
  user: {
    username: sessionStorage.getItem('username'),
    password: sessionStorage.getItem('password'),
    address: sessionStorage.getItem('address'),
    publickey: sessionStorage.getItem('publickey'),
    balance: 0,
  },
};

const getters = {
  getUsername: (state) => state.user.username,
  getAddress: (state) => state.user.address,
  getPublicKey: (state) => state.user.publickey,
  getPassword: (state) => state.user.password,
};

const mutations = addMutations(types, Vue);
mutations.SET_BALANCE = (state, balance) => {
  state.user.balance = balance;
};
mutations.SET_USERNAME = (state, username) => {
  state.user.username = username;
  sessionStorage.setItem('username', username);
};
mutations.SET_ADDRESS = (state, address) => {
  state.user.address = address;
  sessionStorage.setItem('address', address);
};
mutations.SET_PASSWORD = (state, password) => {
  state.user.password = password;
  sessionStorage.setItem('password', password);
};
mutations.SET_PUBLICKEY = (state, publickey) => {
  state.user.publickey = publickey;
  sessionStorage.setItem('publickey', publickey);
};

const CryptoJS = require('crypto-js');

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

      // stores encripterd private key in local storage
      store.commit('SET_ADDRESS', address);
      store.commit('SET_USERNAME', contents.data.username);
      store.commit('SET_PASSWORD', contents.data.password);
      store.commit('SET_PUBLICKEY', store.state.postLoginAsyncData?.data?.publicKey);

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

      store.commit('SET_ADDRESS', acc.address);
      store.commit('SET_USERNAME', contents.data.username);
      store.commit('SET_PASSWORD', contents.data.password);
      store.commit('SET_PUBLICKEY', acc.publicKey);

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

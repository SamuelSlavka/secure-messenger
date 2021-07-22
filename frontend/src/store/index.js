import Vue from 'vue';
import Vuex from 'vuex';
import auth from '@/store/modules/auth';
import users from '@/store/modules/users';
import message from '@/store/modules/message';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    auth,
    users,
    message,
  },
});

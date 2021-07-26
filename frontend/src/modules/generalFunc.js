const CryptoJS = require('crypto-js');

// decrypts PK
export function getPK() {
  const passwdKey = sessionStorage.getItem('password');

  const pk = localStorage.getItem('privateKey');
  const bytes = CryptoJS.AES.decrypt((pk.toString()), passwdKey);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// dynamically add state mutations
export function addMutations(types, Vue) {
  const mutations = {};

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

  return mutations;
}

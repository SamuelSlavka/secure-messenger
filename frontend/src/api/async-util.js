import axios from 'axios';

const doAsync = async (store, {
  contents, token, mutationTypes,
}) => {
  // clean up store
  store.commit(mutationTypes.BASE, {
    type: mutationTypes.SUCCESS,
    value: {},
  });

  store.commit(mutationTypes.BASE, {
    type: mutationTypes.FAILURE,
    value: null,
  });

  // set type to pending
  store.commit(mutationTypes.BASE, {
    type: mutationTypes.PENDING,
    value: true,
  });

  try {
    let response;
    // post
    if (contents.type === 'post') {
      response = await axios({
        url: contents.url,
        baseURL: process.env.VUE_APP_BASE_URL,
        method: contents.type,
        headers: { Authorization: `Bearer ${token}` },
        data: contents.data,
      });
    // get
    } else {
      response = await axios({
        url: contents.url,
        baseURL: process.env.VUE_APP_BASE_URL,
        method: contents.type,
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    // if (callback) {
    // response = callback(response);
    // }

    // set state to success
    store.commit(mutationTypes.BASE, {
      type: mutationTypes.SUCCESS,
      data: response,
      statusCode: response.status,
    });

    store.commit(mutationTypes.BASE, {
      type: mutationTypes.PENDING,
      value: false,
    });
  } catch (error) {
    console.log(error);
    store.commit(mutationTypes.BASE, {
      type: mutationTypes.PENDING,
      value: false,
    });
    store.commit(mutationTypes.BASE, {
      type: mutationTypes.FAILURE,
      statusCode: error.response.status,
    });
  }
};
export default doAsync;

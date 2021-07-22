import _ from 'lodash';

const createAsyncMutation = (type) => ({
  BASE: `${type}`,
  SUCCESS: `${type}_SUCCESS`,
  FAILURE: `${type}_FAILURE`,
  PENDING: `${type}_PENDING`,
  loadingKey: `${_.camelCase(type)}Pending`,
  statusCode: `${_.camelCase(type)}StatusCode`,
  stateKey: `${_.camelCase(type)}Data`,
});

export const POST_INFO_ASYNC = createAsyncMutation('POST_INFO_ASYNC');
export const GET_INFO_ASYNC = createAsyncMutation('GET_INFO_ASYNC');
export const POST_REGISTER_ASYNC = createAsyncMutation('POST_REGISTER_ASYNC');
export const POST_LOGIN_ASYNC = createAsyncMutation('POST_LOGIN_ASYNC');
export const POST_CONTACTS_ASYNC = createAsyncMutation('POST_CONTACTS_ASYNC');
export const POST_MESSAGES_ASYNC = createAsyncMutation('POST_MESSAGES_ASYNC');
export const GET_BALANCE_ASYNC = createAsyncMutation('GET_BALANCE_ASYNC');

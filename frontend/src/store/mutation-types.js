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

// auth types
export const POST_INFO_ACTION = createAsyncMutation('POST_INFO_ACTION');
export const REGISTER_ACTION = createAsyncMutation('REGISTER_ACTION');
export const LOGIN_ACTION = createAsyncMutation('LOGIN_ACTION');
// user types
export const GET_CONTACTS_ACTION = createAsyncMutation('GET_CONTACTS_ACTION');
export const GET_BALANCE_ACTION = createAsyncMutation('GET_BALANCE_ACTION');
export const ADD_FOUNDS_ACTION = createAsyncMutation('ADD_FOUNDS_ACTION');

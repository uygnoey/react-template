import _ from "lodash";
import axios from "axios";
import history from "./history";

export const config = (() => {
  const env = {
    production: {
      live: {
        // TODO: Live ip address 변경 필요
        uri: 'http://localhost:8080'
      },
      dev: {
        uri: 'http://localhost:8080'
      },
    },
    development: {
      dev: {
        uri: 'http://localhost:8080'
      },
      local: {
        uri: 'http://localhost:8080',
      }
    }
  };
  let conf = env[process.env.NODE_ENV];
  if (process.env.NODE_ENV === 'production') {
    conf = conf[process.env.REACT_APP_BUILD || 'dev'];
  } else {
    conf = conf[process.env.REACT_APP_BUILD || 'local'];
  }
  return _.defaultsDeep(conf, {
    node_env: process.env.NODE_ENV,
    build_mode: process.env.REACT_APP_BUILD || process.env.NODE_ENV === 'production' ? 'dev' : 'local',
    uri: 'http://localhost:8080'
  });
})();

export const apiServer = axios.create({
  baseURL: config.uri,
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
});

apiServer.defaults.withCredentials = false;
apiServer.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

apiServer.interceptors.request.use((config) => {
  return config;
}, (error) => {
  return Promise.reject(error);
});

apiServer.interceptors.response.use((response) => {
  if (response.status === 302) {
    if (response.headers.location) {
      return;
    }
  }
  
  return response;
}, (error) => {
  if (error.response.status === 401) {
    return error.response;
  }
  
  return Promise.reject(error);
});

export {axios, history};

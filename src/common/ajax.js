import axios from 'axios';
import Vue from 'vue';
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import  {toolsUtils } from "./toolsUtils";
import  {authService } from "../service";

const defaults = {
  loadingText: '努力加载中...'
};

const settings = {
  baseURL: '',
  token: '',
  requestCount: 0,
  headers: { 'Content-Type': 'application/json' }
};

const closeLoading = () => {
  settings.requestCount--;
  if (settings.requestCount <= 0) {
    //1
    // Vue.$vux.loading.hide()
    NProgress.done(); 
  }
};

const request = (method, url, data, options = {}) => {
  options = Object.assign({}, defaults, options, {
    url,
    method,
    data,
    baseURL: options.baseURL || settings.baseURL,
    headers: options.headers || settings.headers,
    crossDomain: true,
    withCredentials: options.withCredentials !== false //禁止使用跨域使用false
  });
  // if (settings.token) {
  //   options.headers['Authorization'] = settings.token;
  // }
  var token=authService.getToken();
  if(token)
  {
    options.headers['Authorization'] = token.token_type+" "+token.access_token;
  }
  settings.requestCount++;
  //1
  // if (!options.noLoading) {
  //   Vue.$vux.loading.show({
  //     text: options.loadingText
  //    })
  // }
  if (!options.noLoading) {
      NProgress.start();
  }

  if(options.nocrypt)
  {
    if(options.data)
    {
    options.data={encryStr:toolsUtils.encrypt(JSON.stringify(options.data),"0123456789abcdef")};
    }
  }

  return axios.request(options)
    .then(res => {
      closeLoading();
      return res;
    })
    .catch(err => {
      closeLoading();
      if (err.response.status && err.response.status === 401) {
        console.log('登录状态过期,即将跳转登录页');
        // setTimeout(function () {
        //   location.href = '/Login';
        // }, 1000);
      }
      let errMessage = err.response.data.ErrorMessage;
      if (!options.noErrorTip) {
        console.log(errMessage);
        // messageBox.error(errMessage);
      }
      return Promise.reject(err);
    });
};
export const ajax = {
  setBaseUrl(baseUrl) {
    settings.baseURL = baseUrl;
  },
  setToken(token) {
    settings.token = token;
  },
  get(url, options) {
    return request('get', url, null, options);
  },
  delete(url, data, options) {
    return request('delete', url, data, options);
  },
  post(url, data, options) {
    return request('post', url, data, options);
  },
  put(url, data, options) {
    return request('put', url, data, options);
  }
};

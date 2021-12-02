import Vue from 'vue'
import { storage } from '../common';
let baseData = Vue.prototype.baseData;
 
 
  function getToken() {
    try 
    {
      var toekntime=  new Date(sessionStorage.getItem("tokenTime"))
      if(toekntime<new Date())
      {
        return null;
      }
      var token=storage.session.get('token');
      if(token==null||token=='')
      {
          return null;
      }
    return JSON.parse(token);
    }
    catch(err){
      console.log(err);
      return null;
    }
  }
  
    function setToken(token) {
     
      if(token==null||token==undefined||token.expires_in==null)
      {
        return false;        
      }
      storage.session.set('tokenTime', new Date(new Date().getTime()+(token.expires_in*1000)-10000));
      storage.session.set('token', JSON.stringify(token));
      return true;
  }
  
    function removeToken() {
 
    return storage.session.remove(token)
  }

  function toWeChatOauth(type)
  {
 
      let wxurl= baseData.authorize_url+'appid='+baseData.appid+'&redirect_uri='+
      baseData.redirect_uri+'&response_type=code&scope=snsapi_base&state='+type+'&connect_redirect=1#wechat_redirect';
      return wxurl;
 
  }
  

export const authService = {
    setToken,
    removeToken,
    getToken,
    toWeChatOauth
};

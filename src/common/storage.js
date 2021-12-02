class WebStorage {
    constructor(instance) {
      this.instance = instance;
    }

    get(key) {
      return this.instance.getItem(key);
      //return JSON.parse(this.instance.getItem(key));
    }

    set(key, value) {
      // if(typeof value === 'string'){
      //   this.instance.setItem(key, value);
      // }else{
      //   this.instance.setItem(key, JSON.stringify(value));
      // }
      this.instance.setItem(key, value);
    }

    delete(key) {
      this.instance.removeItem(key);
    }

    clear() {
      this.instance.clear();
    }
  }

  const memoryMap = new Map();

  export const storage = {
    local: new WebStorage(localStorage),
    session: new WebStorage(sessionStorage),
    memory: {
      get(key) {
        return memoryMap.get(key);
      },
      set(key, value) {
        memoryMap.set(key, value);
      },
      delete(key) {
        memoryMap.delete(key);
      },
      clear() {
        memoryMap.clear();
      }
    },
    cookie: {
      get(key) {
        let cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          let cArr = cookie.split('=');
          if (cArr[0].trim() === key) {
            return cArr[1];
          }
        }
        return null;
      },
      set(key) {}
    }
  };

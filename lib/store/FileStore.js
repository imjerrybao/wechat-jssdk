const debug = require('debug')('wechat-file');
const fs = require('fs');
const path = require('path');

const Store = require('./Store');

/**
 * Simple Store using json file
 */
class FileStore extends Store {

  constructor (options = {}) {
    super(options);

    debug('using FileStore...');
    this.fileStorePath = options.fileStorePath
      ? path.resolve(options.fileStorePath)
      : path.resolve(process.cwd(), 'wechat-info.json')
      ;
    
    try {
      fs.statSync(this.fileStorePath);
    } catch (e) {
      //write the default empty store object to file
      fs.writeFileSync(this.fileStorePath, JSON.stringify(this.store));
      debug('create wechat info file finished');
    } finally {
      const storeStr = fs.readFileSync(this.fileStorePath);
      if(storeStr) {
        try {
          this.store = JSON.parse(storeStr);
        } catch (e) {
          debug('wechat json file invalid! Will use empty store instead');
        }
      }
    }

  }

  flush () {
    fs.writeFile(this.fileStorePath, JSON.stringify(this.store), (err) => {
      if(err) {
        debug('ERROR: export wechat info to file failed!');
        debug(err);
        return;
      }
      super.flush();
      debug('export wechat info to file finished');
    });
  }

  destroy () {
    super.destroy();
    debug('fileStore destroyed!');
  }

}

module.exports = FileStore;
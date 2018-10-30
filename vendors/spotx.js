const fetch = require('node-fetch');
const debug = require('debug')('vmap-plugin-spotx');

class VendorSpotX {
  constructor() {

  }

  fetchVast(params, options) {
    // http://search.spotxchange.com/vast/3.0/79391?VPI[]=MP4&media_transcoding=high&ssai[enabled]=1&ssai[vendor]=yospace&content[livestream]=0&pod[size]=3
    return new Promise((resolve, reject) => {
      let accountId = '79391';
      let timeout = 2000;
      if (params) {
        if (params.accountId) {
          accountId = params.accountId;
        }
      }
      if (options) {
        if (options.timeout) {
          timeout = options.timeout;          
        }
      }
      debug(`accountId=${accountId}, timeout=${timeout}`);
      fetch(`https://search.spotxchange.com/vast/3.0/${accountId}?VPI[]=MP4&media_transcoding=high&ssai[enabled]=1&ssai[vendor]=yospace&content[livestream]=0&pod[size]=1`, { timeout: timeout })
      .then(res => res.text())
      .then(body => {
        resolve(body);
      })
      .catch(err => {
        reject(err);
      });
    })

  }

  identity() {
    return 'spotx';
  }
}

module.exports = VendorSpotX;
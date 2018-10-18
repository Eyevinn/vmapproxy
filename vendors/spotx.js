const fetch = require('node-fetch');
const debug = require('debug')('vmap-plugin-spotx');

class VendorSpotX {
  constructor() {

  }

  fetchVast(params) {
    // http://search.spotxchange.com/vast/3.0/79391?VPI[]=MP4&media_transcoding=high&ssai[enabled]=1&ssai[vendor]=yospace&content[livestream]=0&pod[size]=3
    return new Promise((resolve, reject) => {
      let accountId = '79391';
      if (params) {
        if (params.accountId) {
          accountId = params.accountId;
        }
      }
      debug(`accountId=${accountId}`);
      fetch(`http://search.spotxchange.com/vast/3.0/${accountId}?VPI[]=MP4&media_transcoding=high&ssai[enabled]=1&ssai[vendor]=yospace&content[livestream]=0&pod[size]=1`, { timeout: 2000 })
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
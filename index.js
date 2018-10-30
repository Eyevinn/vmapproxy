const restify = require('restify');
const debug = require('debug')('vmap-proxy');
const xmlbuilder = require('xmlbuilder');
const VendorsFactory = require('./vendors/factory.js');

const AD_REQUEST_TIMEOUT = process.env.AD_REQUEST_TIMEOUT || 2000;

class VmapProxy {
  constructor() {
    this.server = restify.createServer();
    this.server.use(restify.plugins.queryParser());

    this.server.get('/', this._handleHealthCheck.bind(this));
    this.server.get('/vmap/:vendor', this._handleVmap.bind(this));
  }

  listen(port) {
    this.server.listen(port, () => {
      debug(`${this.server.name} listening at ${this.server.url}`);
    });
  }

  _handleHealthCheck(req, res, next) {
    res.send(200, { status: 'ok' });
    next();
  }

  _handleVmap(req, res, next) {
    debug(`req.url=${req.url}, query=${JSON.stringify(req.query)}, params=${JSON.stringify(req.params)}`);
    const factory = new VendorsFactory();
    const vendor = factory.createVendorInstance(req.params.vendor);
    debug(`vendor=${vendor.identity()}`);

    if (!req.query.bp) {
      next(new Error('bp query parameter is mandatory'));
    } else {
      let breaks = req.query.bp.split(',');
      let root = xmlbuilder.create('vmap:VMAP', {version: '1.0', encoding: 'UTF-8'});
      root.att('xmlns:vmap', 'http://www.iab.net/vmap-1.0');
      root.att('version', '1.0');
      let vastPromiseChain = [];
      let adPods = {};
      breaks.forEach(b => {
        let offset = b;
        let p = new Promise((resolve, reject) => {
          vendor.fetchVast(req.query, { timeout: AD_REQUEST_TIMEOUT }).then(xml => {
            xml = xml.replace('<?xml version="1.0" encoding="UTF-8" ?>', '');
            adPods[offset] = { offset: offset, xml: xml };
            resolve();
          })
          .catch(err => {
            reject(err);
          });
        });
        vastPromiseChain.push(p);
      });
      Promise.all(vastPromiseChain).then(() => {
        breaks.forEach(offset => {
          let pod = adPods[offset];
          let eleAdBreak = root.ele('vmap:AdBreak')
            .att('breakType', 'linear')
            .att('timeOffset', pod.offset);
          let eleAdSource = eleAdBreak.ele('vmap:AdSource')
            .att('id', pod.offset)
            .att('allowMultipleAds', 'true')
            .att('followRedirects', 'true');
          eleAdSource.ele('vmap:VASTAdData').raw(pod.xml);
        });
        let xml = root.end({ pretty: true });
        res.sendRaw(200, xml, {
          "Content-Type": "text/xml"      
        });
        next();
      }).catch(err => {
        next(new Error(err));
      });
    }
  }
}

const proxy = new VmapProxy();
proxy.listen(process.env.PORT || 4000);

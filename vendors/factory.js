const VendorSpotX = require('./spotx.js');

const VENDORS = {
  'spotx': VendorSpotX
}

class VendorsFactory {
  constructor() {

  }

  createVendorInstance(vendor) {
    const plugin = VENDORS[vendor];
    return new plugin();
  }
}

module.exports = VendorsFactory;
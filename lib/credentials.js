const getCredentials = function(service) {
  
  /****
    VCAP_SERVICES
    This is Bluemix
  ****/
  if (typeof process.env.VCAP_SERVICES === 'string') {
    console.log("Using Bluemix config")
    var services = {}
  }

  // Not Bluemix, so create empty services object
  else {
    var services = {};
  }

  // ETCD_URL
  // This is local configuration
  // append to existing services
  if (typeof process.env.ETCD_URL === 'string') {
    console.log("Using local config for Etcd")
    services["user-provided"] = [
      {
        name: "Etcd by Compose",
        credentials: {
          url: process.env.ETCD_URL
        }
          
      }
    ]

  }

  // Find required service
  for(var i in services["user-provided"]) {
    if (services["user-provided"][i].name.match(service)) {
      return services["user-provided"][i].credentials;
    }
  }
  return null;
};

module.exports = {
  getCredentials: getCredentials
}
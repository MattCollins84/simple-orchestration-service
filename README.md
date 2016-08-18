# Simple Registry Service UI

The [Simple Registry Service Service Registry Module](https://github.com/mattcollins84/simple-service-registry).

You can also set and modify Environment Parameters from within the UI.

## Running the App locally

Clone this repository then run `npm install` to add the Node.js libraries required to run the app.

Then create some environment variables that contain your Etcd URL:

```sh
# Etcd URL
export ETCD_URL='https://<USERNAME>:<PASSWORD>@<HOSTNAME>'
```

replacing the `USERNAME`, `PASSWORD` and `HOSTNAME` placeholders for your own details.

Then run:

```sh
node app.js
```

## Lockdown mode

To restrict access to the Simple Service Registry, export a `LOCKDOWN` environment variable:

```sh
export LOCKDOWN=true
node app.js
```

or set a custom environment variable in Bluemix.

When lockdown mode is detected, all web requests will be get a `401 Unauthorised` response.

If you wish to get access to the Simple Service Registry whilst in lockdown mode, you can enable basic HTTP authentication by setting two more environment variables:


* `SSR_LOCKDOWN_USERNAME`
* `SSR_LOCKDOWN_PASSWORD`

When these are set, you are able to bypass lockdown mode by providing a matching username and password. If you access the UI, your browser will prompt you for these details.

## Contributing

The projected is released under the Apache-2.0 license so forks, issues and pull requests are very welcome.
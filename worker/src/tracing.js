//
// https://docs.honeycomb.io/getting-data-in/opentelemetry/node-distro/
//

const { HoneycombSDK } = require('@honeycombio/opentelemetry-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const opentelemetry = require('@opentelemetry/api');

const sdk = new HoneycombSDK({
    instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();

module.exports = {
    tracer: opentelemetry.trace.getTracer(process.env.OTEL_SERVICE_NAME),
};

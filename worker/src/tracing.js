//
// https://docs.honeycomb.io/getting-data-in/opentelemetry/node-distro/
// https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_api.TraceAPI.html
// https://opentelemetry.io/docs/
//

const { HoneycombSDK } = require('@honeycombio/opentelemetry-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const opentelemetry = require('@opentelemetry/api');

const sdk = new HoneycombSDK({
    instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();

//
// Global tracer for this service.
//
const tracer = opentelemetry.trace.getTracer(process.env.OTEL_SERVICE_NAME);

//
// Makes a new span (and handles errors).
//
async function makeSpan(name, fn) {
    await tracer.startActiveSpan(name, async span => {
        try {
            await fn();				
        }
        catch (err) {
            // Records the error.
            span.recordException(err);
            
            // Rethrow the exception.
            throw err;			
        }
        finally {
            span.end();
        }
    });
}


module.exports = {
    tracer,
    makeSpan,
};

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

//
// Reports an error via open telemetry.
//
async function reportError(fn) {
    try {
        await fn();
    }
    catch (err) {
        console.error("An error occurred:");
        console.error(err);

        const span = opentelemetry.trace.getActiveSpan();
        if (span) {
            span.recordException(err);
        }

        throw err;
    }
}

//
// Adds an attribute to the current open telemetry span.
//
function setAttribute(name, value) {
    const activeSpan = opentelemetry.trace.getActiveSpan();
    if (activeSpan) {        
        activeSpan.setAttribute(name, value);
    }
}

//
// Records an event with open telemetry.
//
function recordEvent(eventName, attributes) {
	const activeSpan = opentelemetry.trace.getActiveSpan();
    if (activeSpan) {
        activeSpan.addEvent(eventName, attributes);
    }
}

module.exports = {
    tracer,
    makeSpan,
    reportError,
    setAttribute,
    recordEvent,
};

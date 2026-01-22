import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import appConfig from "@delegate/config";

export function createTracingSDK(serviceName: string) {
  const traceExporter = new OTLPTraceExporter({
    url: appConfig.monitoring.otelEndpoint,
  });

  const sdk = new NodeSDK({
    serviceName,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": {
          enabled: false,
        },
      }),
    ],
  });

  return sdk;
}

export function startTracing(serviceName: string) {
  const sdk = createTracingSDK(serviceName);
  sdk.start();
  console.log(`Tracing initialized for ${serviceName}`);

  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("Tracing terminated"))
      .catch((error) => console.log("Error terminating tracing", error))
      .finally(() => process.exit(0));
  });

  return sdk;
}

// Re-export trace API for use in other packages
export { trace, context, SpanStatusCode } from "@opentelemetry/api";

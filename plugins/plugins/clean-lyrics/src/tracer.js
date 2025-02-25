// Based on https://github.com/Inrixia/neptune-plugins/blob/3d28c9ea3252782da830698032dbb49dbe5b9fd6/plugins/_lib/trace.ts
// Credits to inrixia

import { actions } from "@neptune";

export const Tracer = (source) => {
	const createLogger = (logger) => {
		const _logger = (...data) => {
			logger(source, ...data);
			return undefined;
		};
		_logger.withContext = (context) => (...data) => {
			logger(source, context, ...data);
			return undefined;
		};
		return _logger;
	};

	const log = createLogger(console.log);
	const warn = createLogger(console.warn);
	const err = createLogger(console.error);
	const debug = createLogger(console.debug);

	const createMessager = (logger, messager, severity) => {
		const _messager = (message) => {
			logger(message);
			messager({ message: `${source} - ${message}`, category: "OTHER", severity });
			return undefined;
		};
		_messager.withContext = (context) => {
			const loggerWithContext = logger.withContext(context);
			return (message) => {
				loggerWithContext(message);
				if (message instanceof Error) message = message.message;
				messager({ message: `${source}.${context} - ${message}`, category: "OTHER", severity });
				return undefined;
			};
		};
		return _messager;
	};

	return {
		log,
		warn,
		err,
		debug,
		msg: {
			log: createMessager(log, actions.message.messageInfo, "INFO"),
			warn: createMessager(warn, actions.message.messageWarn, "WARN"),
			err: createMessager(err, actions.message.messageError, "ERROR"),
		},
	};
};

export const libTrace = Tracer("[lib]");
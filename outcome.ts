interface OutcomeOk<TVal> {
	readonly val: TVal;
	readonly err: undefined;
	isOk(): this is OutcomeOk<TVal>;
	isErr(): this is OutcomeErr;
}

interface OutcomeErr {
	readonly val: undefined;
	readonly err: string;
	isOk(): this is OutcomeOk<never>;
	isErr(): this is OutcomeErr;
}

export type Outcome<TVal = undefined> = OutcomeOk<TVal> | OutcomeErr;
export type POutcome<TVal = undefined> = Promise<Outcome<TVal>>;

/**
 * simple Outcome class is an attempt to make error handling more ergonomic
 * throw freely, catch with nice wrapper:
 * Outcomes.Try(() => funcThatThrows())
 */
export class Outcomes {
	private constructor() {}
	// future Static Helpers for common patterns
	// static Unwrap()
	// static Expect()
	// static UnwrapOr()

	//

	// Static Constructors

	static Ok(): OutcomeOk<undefined>;
	static Ok<TVal>(value: TVal): OutcomeOk<TVal>;
	static Ok<TVal>(value?: TVal): OutcomeOk<TVal | undefined> {
		return {
			val: value,
			err: undefined,
			isOk() {
				return true;
			},
			isErr() {
				return false;
			},
		} as OutcomeOk<TVal | undefined>;
	}

	static Err(err: string, orig?: OutcomeErr): OutcomeErr {
		if (!orig) {
			return makeErr(err);
		}

		return makeErr(`${err} : ${orig.err}`);
	}

	static Errs(...err: string[]): OutcomeErr {
		return Outcomes.Err(err?.join(" : ") ?? "");
	}

	static ErrAny(_err: unknown): OutcomeErr {
		let err: string;

		if (!_err) {
			err = "unknown error";
		} else if (typeof _err === "string") {
			err = _err;
		} else if (_err instanceof Error) {
			err = `${_err.name} : ${_err.message} : ${_err.cause} : ${_err.stack}`;
			// } else if (typeof _err === "object") {
			// 	if (Object.hasOwn(_err, "error")) {
			// 		const innerErr = (_err as { error: unknown }).error;
			// 		err = new Error(String(innerErr));
			// 	} else {
			// 		err = new Error("unknown error obj");
			// 	}
		} else {
			err = String(_err);
		}

		return Outcomes.Err(err);
	}

	static Try<TVal>(expr: () => TVal): Outcome<TVal> {
		if (!expr) {
			return Outcomes.Err("expr is nil");
		}

		try {
			const result = expr();
			return Outcomes.Ok(result);
		} catch (err) {
			return Outcomes.ErrAny(err);
		}
	}

	static async TryAsync<TVal>(asyncExpr: () => Promise<TVal>): Promise<Outcome<TVal>> {
		if (!asyncExpr) {
			return Promise.resolve(Outcomes.Err("TryAsync expr is nil"));
		}

		return Outcomes.TryPromise(asyncExpr());
	}

	static async TryPromise<TVal>(prom: Promise<TVal>): Promise<Outcome<TVal>> {
		if (!prom) {
			return Promise.resolve(Outcomes.Err("TryPromise promise is nil"));
		}

		try {
			const result = await prom;
			return Outcomes.Ok(result);
		} catch (err) {
			return Outcomes.ErrAny(err);
		}
	}
}

const makeErr = (error: string): OutcomeErr => {
	return {
		val: undefined,
		err: error,
		isOk() {
			return false;
		},
		isErr() {
			return true;
		},
	} as OutcomeErr;
};

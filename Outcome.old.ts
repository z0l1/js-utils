export class Outcome<TVal = void, TErr extends Error | undefined = Error | undefined> {
	#value: TVal | undefined;
	#error: TErr;

	private constructor(value: TVal | undefined, error: TErr) {
		this.#value = value;
		this.#error = error;
	}

	public get value(): TVal | undefined {
		return this.#value;
	}

	public get error(): TErr {
		return this.#error;
	}

	public isError(): this is Outcome<TVal, Exclude<TErr, undefined>> {
		return this.#error !== undefined;
	}

	public isOk(): this is Outcome<TVal, undefined> {
		return this.#error === undefined;
	}

	// future Static Helpers for common patterns
	// static Unwrap()
	// static Expect()
	// static UnwrapOr()

	// Static Constructors

	static Ok<TVal = void>(value?: TVal): Outcome<TVal, undefined> {
		return new Outcome<TVal, undefined>(value, undefined);
	}

	static Err(error: string): Outcome<never, Error>;
	static Err<TErr extends Error>(error: TErr): Outcome<never, TErr>;
	// static Err<TErr>(error: TErr): Outcome<never, unknown>;
	static Err<TErr extends Error>(error: string | TErr): Outcome<never, TErr | Error> {
		if (typeof error === "string") {
			return new Outcome<never, Error>(undefined, new Error(error));
		}

		return new Outcome<never, TErr>(undefined, error);
	}

	static Try<TTVal>(expr: () => TTVal): Outcome<TTVal> {
		if (!expr) {
			return Outcome.Err("expr is nil");
		}

		try {
			const result = expr();
			return Outcome.Ok(result);
		} catch (err) {
			if (err instanceof Error) {
				return Outcome.Err(err);
			}

			if (typeof err === "string") {
				return Outcome.Err(err);
			}

			const strErr = String(err);
			return Outcome.Err(`unknown error: ${strErr}`);
		}
	}

	static async TryAsync<TTVal>(asyncExpr: () => Promise<TTVal>): Promise<Outcome<TTVal>> {
		if (!asyncExpr) {
			return Promise.resolve(Outcome.Err("expr is nil"));
		}

		return Outcome.TryPromise(asyncExpr());
	}

	static async TryPromise<TTVal>(prom: Promise<TTVal>): Promise<Outcome<TTVal>> {
		if (!prom) {
			return Promise.resolve(Outcome.Err("promise is nil"));
		}

		try {
			const result = await prom;
			return Outcome.Ok(result);
		} catch (err) {
			if (err instanceof Error) {
				return Outcome.Err(err);
			}

			if (typeof err === "string") {
				return Outcome.Err(err);
			}

			const strErr = String(err);
			return Outcome.Err(`unknown error: ${strErr}`);
		}
	}
}

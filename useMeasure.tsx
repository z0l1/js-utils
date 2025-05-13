/**
 * a weird time logger to find out
 * (elapsed time since last log)
 */

import { PropsWithChildren, useCallback, useEffect, useRef } from "react";

type TimeLog = {
	label?: string;
	time: number;
	elapsed: number;
};

export const useMeasure = (tag?: string) => {
	const times = useRef<TimeLog[]>([]);

	const savedTag = useRef(tag);
	useEffect(() => {
		savedTag.current = tag;
	}, [tag]);

	const tlog = useCallback((_label?: string) => {
		const time = performance.now();
		let elapsed = 0;

		if (times.current.length > 1) {
			const lastLog = times.current[times.current.length - 1];
			elapsed = time - lastLog.time;
		}

		const _tag = savedTag.current ? `[${savedTag.current}] ` : "";
		const label = `${_tag}${_label}`;
		const _log: TimeLog = { label, time, elapsed };

		// const elapsedMs = elapsed.toFixed(2);
		const elapsedS = (elapsed / 1000).toFixed(2);

		console.log(_tag, _label, `( elapsed ${elapsedS}s )`);
		times.current.push(_log);
	}, []);

	const TLog: React.FC<PropsWithChildren<{ label?: string }>> = ({ label, children }) => {
		tlog(label);
		return <>{children}</>;
	};

	useEffect(() => {
		tlog("mount");
	}, [tlog, tag]);

	return {
		timeLog: tlog,
		TimeLog: TLog
	};
};

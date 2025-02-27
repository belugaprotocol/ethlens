import { BaseProvider } from '@ethersproject/providers';

import { Call, all as callAll, tryAll as callTryAll } from './call';
import { getEthBalance } from './calls';
import { Multicall } from './multicall';

export default class Provider {
	provider?: BaseProvider;
	multicall: Multicall | null;
	multicall2: Multicall | null;

	constructor(provider: BaseProvider, tMulticall: Multicall | null, tMulticall2?: Multicall | null) {
		this.provider = provider
		this.multicall = tMulticall;
		this.multicall2 = null;
		// Set Multicall2 if provided.
		if(tMulticall2) {
			this.multicall2 = tMulticall2;
		}
	}

	/**
	 * Makes one call to the multicall contract to retrieve eth balance of the given address.
	 * @param address  Address of the account you want to look up
	 */
	getEthBalance(address: string) {
		if (!this.provider) {
			throw Error('Provider should be initialized before use.');
		}
		if (!this.multicall) {
			throw Error('Multicall contract is not available on this network.');
		}
		return getEthBalance(address, this.multicall?.address);
	}

	/**
	 * Aggregates multiple calls into one call. Reverts when any of the calls fails. For
	 * ignoring the success of each call, use {@link tryAll} instead.
	 * @param calls  Array of Call objects containing information about each read call
	 * @param block  Block number for this call
	 */
	async all<T>(calls: Call[], block?: number) {
		if (!this.provider) {
			throw Error('Provider should be initialized before use.');
		}
		if (!this.multicall) {
			console.log(
				'Multicall contract is not available on this network, using deployless version.',
			);
		}
		const provider = this.provider as BaseProvider;
		return await callAll<T>(provider, this.multicall, calls, block);
	}

	/**
	 * Aggregates multiple calls into one call. If any of the calls fail, it returns a null value
	 * in place of the failed call's return data.
	 * @param calls  Array of Call objects containing information about each read call
	 * @param block  Block number for this call
	 */
	async tryAll<T>(calls: Call[], block?: number) {
		if (!this.provider) {
			throw Error('Provider should be initialized before use.');
		}
		if (!this.multicall2) {
			console.log(
				'Multicall2 contract is not available on this network, using deployless version.',
			);
		}
		const provider = this.provider as BaseProvider;
		return await callTryAll<T>(provider, this.multicall2, calls, block);
	}
}

import { injectable } from 'inversify';
import 'reflect-metadata';
import * as WebRequest from 'web-request';

import { Rpc, CtRpc, RpcAddressInfo, RpcRawTx, RpcUnspentOutput } from '../src/abstract/rpc';
import {
    Prevout,
    ISignature,
    BlindPrevout,
    CryptoAddressType,
    CryptoAddress,
    ToBeBlindPrevout,
    EphemeralKey,
    ToBeBlindOutput,
    Output
} from '../src/interfaces/crypto';
import { toSatoshis, fromSatoshis, asyncMap, asyncForEach, clone, log } from '../src/util';
import { TransactionBuilder } from '../src/transaction-builder/transaction';
import { CoreRpcService } from './rpc.stub';

@injectable()
class CtCoreRpcService extends CtRpc {

    private RPC_REQUEST_ID = 1;
    private DEBUG = true;

    constructor(host: string, port: number, user: string, password: string) {
        super(host, port, user, password);
    }

    public async getNewAddress(): Promise<string> {
        return await this.call('getnewaddress');
    }

    public async getAddressInfo(address: string): Promise<RpcAddressInfo> {
        return await this.call('getaddressinfo', [address]);
    }

    public async importAddress(address: string, label: string, rescan: boolean, p2sh: boolean): Promise<void> {
        await this.call('importaddress', [address, label, rescan, p2sh]);
    }

    public async sendToAddress(address: string, amount: number, comment: string): Promise<string> {
        return await this.call('sendtoaddress', [address, amount, comment]);
    }

    public async createSignatureWithWallet(hex: string, prevtx: Output, address: string): Promise<string> {
        return await this.call('createsignaturewithwallet', [hex, prevtx, address]);
    }

    /**
     * Send a raw transaction to the network, returns txid.
     * @param hex the raw transaction in hex format.
     */
    public async sendRawTransaction(hex: string): Promise<string> {
        return (await this.call('sendrawtransaction', [hex]));
    }

    /**
     * Get a raw transaction, always in verbose mode
     * @param txid
     */
    public async getRawTransaction(txid: string): Promise<RpcRawTx> {
        return await this.call('getrawtransaction', [txid, true]);
    }

    public async listUnspent(minconf: number): Promise<RpcUnspentOutput[]> {
        return await this.call('listunspent', [minconf]);
    }

    /**
     * Permanently locks outputs until unlocked or spent.
     * @param prevout an array of outputs to lock
     */
    public async lockUnspent(prevouts: Prevout[]): Promise<boolean> {
        return await this.call('lockunspent', [false, prevouts, true]);
    }

    // CtRpc required implmentations below...

    public async getNewStealthAddress(): Promise<CryptoAddress> {
        const sx = await this.call('getnewstealthaddress');
        return {
            type: CryptoAddressType.STEALTH,
            address: sx
        } as CryptoAddress;
    }

    public async getBlindPrevouts(satoshis: number, blind?: string): Promise<BlindPrevout[]> {
        return [await this.createBlindPrevoutFromAnon(satoshis, blind)];
    }

    /**
     * Verify value commitment.
     * note that the amount is satoshis, which differs from the rpc api
     *
     * @param commitment
     * @param blind
     * @param satoshis
     */
    public async verifyCommitment(commitment: string, blind: string, satoshis: number): Promise<boolean> {
        return (await this.call('verifycommitment', [commitment, blind, fromSatoshis(satoshis)])).result;
    }

    public async call(method: string, params: any[] = []): Promise<any> {
        const id = this.RPC_REQUEST_ID++;
        const postData = JSON.stringify({
            jsonrpc: '2.0',
            method,
            params,
            id
        });

        const url = 'http://' + this._host + ':' + this._port;
        const options = this.getOptions();

        return await WebRequest.post(url, options, postData)
            .then(response => {

                const jsonRpcResponse = JSON.parse(response.content);
                if (response.statusCode !== 200) {
                    const message = response.content ? JSON.parse(response.content) : response.statusMessage;
                    if (this.DEBUG) {
                        console.error('method:', method);
                        console.error('params:', params);
                        console.error(message);
                    }
                    throw message['error'];
                }

                return jsonRpcResponse.result;
            });
    }

    private getOptions(): any {

        const auth = {
            user: this._user,
            pass: this._password,
            sendImmediately: false
        };

        const headers = {
            'User-Agent': 'OMP regtest',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        const rpcOpts = {
            auth,
            headers
        };

        return rpcOpts;
    }

}

export const node0 = new CtCoreRpcService('localhost', 19792, 'rpcuser0', 'rpcpass0');
export const node1 = new CtCoreRpcService('localhost', 19793, 'rpcuser1', 'rpcpass1');
export const node2 = new CtCoreRpcService('localhost', 19794, 'rpcuser2', 'rpcpass2');

export { CtCoreRpcService };